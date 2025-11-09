import { Project, SyntaxKind } from 'ts-morph'
import * as path from 'path'
import * as fs from 'fs'
import { promises as fsp } from 'fs'
import { spawn } from 'child_process'
import { format } from 'prettier'
import { loadConfig, getResolvedPaths } from '../../config.js'

export interface OperationToWrite {
  operationName: string
  operationType: 'query' | 'mutation'
  prompt: string
  inputType: string
  handler: string
  // Mutation-specific fields (full.md format)
  optimistic?: string
  validate?: string
  dependencies?: {
    tables?: string[]
    columns?: string[]
  }
  pseudocode?: string
  functionNameSuggestion?: string
  targetFilePath?: string
}

export interface WriteFileOptions {
  createDirectories?: boolean
  overwrite?: boolean
}

function kebabCase(str: string) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase()
}

export class FileWriteHandler {
  public async writeOperationToFile(
    operation: OperationToWrite
  ): Promise<void> {
    const projectRoot = process.cwd()
    const operationTypePlural =
      operation.operationType === 'query' ? 'queries' : 'mutations'

    const newOperationFileName = `${kebabCase(operation.operationName)}.ts`
    const cfg = loadConfig()
    const pathsResolved = getResolvedPaths(cfg)
    const baseDir =
      operation.operationType === 'query'
        ? pathsResolved.queriesDir
        : pathsResolved.mutationsDir
    const newOperationFilePath = path.join(baseDir, newOperationFileName)

    const isQuery = operation.operationType === 'query'
    const variableName = operation.operationName
      .split(' ')
      .map((word, i) =>
        i === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
      )
      .join('')

    const inputTypeCode = this.parseInputTypeFromLLM(operation.inputType)
    const handlerCode = this.parseHandlerFromLLM(operation.handler)

    let newOperationCode: string

    if (operation.operationType === 'mutation') {
      // New full.md format: export default { input, execute, optimistic, validate }
      const optimisticCode = operation.optimistic ||
        `(corsair, data) => ({ ...data, id: \`temp_\${Date.now()}\` })`
      const validateCode = operation.validate ||
        `async (corsair, data) => { if (!corsair.currentUser) throw new Error('Authentication required') }`

      newOperationCode = `
    import { z } from 'corsair'
    import { drizzle } from 'corsair/db/types'

    export default {
      input: ${inputTypeCode},
      execute: ${handlerCode},
      optimistic: ${optimisticCode},
      validate: ${validateCode}
    }
  `
    } else {
      // Queries keep tRPC procedure format
      newOperationCode = `
    import { z } from 'corsair'
    import { procedure } from '../trpc/procedures'
    import { drizzle } from 'corsair/db/types'

    export const ${variableName} = procedure
      .input(${inputTypeCode})
      .query(${handlerCode})
  `
    }

    if (operation.pseudocode) {
      newOperationCode += ``
    }
    if (operation.functionNameSuggestion) {
      newOperationCode += ``
    }
    if (operation.dependencies) {
      newOperationCode += ``
    }

    const formattedContent = await format(newOperationCode, {
      parser: 'typescript',
    })
    await fsp.writeFile(newOperationFilePath, formattedContent)

    const barrelPath = path.join(baseDir, 'index.ts')

    try {
      const existingBarrel = await fsp.readFile(barrelPath, 'utf8')
      const exportLine = `export * from './${newOperationFileName.replace('.ts', '')}'\n`
      if (!existingBarrel.includes(exportLine)) {
        await fsp.appendFile(barrelPath, exportLine)
      }
    } catch {
      const exportLine = `export * from './${newOperationFileName.replace('.ts', '')}'\n`
      await fsp.writeFile(barrelPath, exportLine)
    }

    const operationsFilePath = pathsResolved.operationsFile
    const project = new Project()
    const operationsFile = project.addSourceFileAtPath(operationsFilePath)

    const moduleSpecifierRaw = path.relative(
      path.dirname(operationsFilePath),
      baseDir
    )
    let moduleSpecifier = moduleSpecifierRaw.replace(/\\/g, '/')
    if (!moduleSpecifier.startsWith('.')) {
      moduleSpecifier = './' + moduleSpecifier
    }
    const desiredNs = isQuery ? 'queriesModule' : 'mutationsModule'
    const existingNsImport = operationsFile
      .getImportDeclarations()
      .find(
        d =>
          d.getModuleSpecifierValue() === moduleSpecifier &&
          d.getNamespaceImport()
      )
    if (!existingNsImport) {
      operationsFile.addImportDeclaration({
        moduleSpecifier,
        namespaceImport: desiredNs,
      })
    }

    const operationsVar =
      operationsFile.getVariableDeclaration(operationTypePlural)
    const initializer = operationsVar?.getInitializerIfKind(
      SyntaxKind.ObjectLiteralExpression
    )

    if (initializer) {
      const propName = `"${operation.operationName}"`
      const moduleRef = `${desiredNs}.${variableName}`
      const exists = initializer
        .getProperties()
        .some(p =>
          p.isKind(SyntaxKind.PropertyAssignment)
            ? p.getNameNode().getText() === propName
            : false
        )
      if (!exists) {
        initializer.addPropertyAssignment({
          name: propName,
          initializer: moduleRef,
        })
      }
    }

    operationsFile.formatText()
    await operationsFile.save()

    // Also update procedures.ts with inline definition to avoid circular dependency
    await this.updateProceduresFile(operation, pathsResolved, inputTypeCode, handlerCode)

    await new Promise<void>(resolve => {
      const child = spawn('npx', ['--yes', 'tsc', '--noEmit'], {
        stdio: 'inherit',
        shell: true,
        cwd: projectRoot,
        env: process.env,
      })
      child.on('close', () => resolve())
    })
  }

  private async updateProceduresFile(
    operation: OperationToWrite,
    pathsResolved: any,
    inputTypeCode: string,
    handlerCode: string
  ): Promise<void> {
    const proceduresPath = path.join(
      path.dirname(pathsResolved.queriesDir),
      'trpc',
      'procedures.ts'
    )

    // Check if procedures file exists
    if (!fs.existsSync(proceduresPath)) {
      console.warn(`Procedures file not found at: ${proceduresPath}`)
      return
    }

    try {
      // Read the current procedures file
      const content = await fsp.readFile(proceduresPath, 'utf8')

      // Find the closing brace of the router object
      // Look for the pattern: })  followed by export type
      const routerEndPattern = /\}\)\s*\n\s*export type CorsairProcedureRouter/

      if (!routerEndPattern.test(content)) {
        console.warn('Could not find router closing pattern in procedures.ts')
        return
      }

      // Determine the method type based on operation type
      const methodType = operation.operationType === 'query' ? 'query' : 'mutation'
      const operationTypeLabel = operation.operationType === 'query' ? 'query' : 'mutation'

      // Create the inline operation definition
      const inlineOperation = `
  // Auto-generated ${operationTypeLabel} (defined inline to avoid circular dependency)
  '${operation.operationName}': procedure
    .input(${inputTypeCode})
    .${methodType}(${handlerCode}),`

      // Insert the inline operation before the closing brace
      const updatedContent = content.replace(
        routerEndPattern,
        `${inlineOperation}\n})\n\nexport type CorsairProcedureRouter`
      )

      // Format with prettier
      const formattedContent = await format(updatedContent, {
        parser: 'typescript',
      })

      // Write back to file
      await fsp.writeFile(proceduresPath, formattedContent)

      console.log(`✓ Updated procedures.ts with inline ${operationTypeLabel} for: ${operation.operationName}`)
    } catch (error) {
      console.error('Error updating procedures.ts:', error)
      // Don't throw - this is a nice-to-have feature
    }
  }

  public parseInputTypeFromLLM(inputTypeString: string): string {
    const cleaned = inputTypeString.trim()
    if (cleaned.startsWith('z.object(') || cleaned.startsWith('z.')) {
      return cleaned
    }
    return `z.object(${cleaned})`
  }

  public parseHandlerFromLLM(handlerString: string): string {
    const cleaned = handlerString.trim()

    // Fix common destructuring mistakes from LLM
    // If it's "async (input, ctx)" change to "async ({ input, ctx })"
    if (cleaned.match(/^async\s*\(\s*input\s*,\s*ctx\s*\)/)) {
      return cleaned.replace(/^async\s*\(\s*input\s*,\s*ctx\s*\)/, 'async ({ input, ctx })')
    }

    // If it's "async (ctx)" change to "async ({ ctx })"
    if (cleaned.match(/^async\s*\(\s*ctx\s*\)/)) {
      return cleaned.replace(/^async\s*\(\s*ctx\s*\)/, 'async ({ ctx })')
    }

    // Already has correct destructuring
    if (cleaned.startsWith('async ({')) {
      return cleaned
    }

    // Legacy handling
    if (cleaned.startsWith('async (')) {
      return cleaned
    }
    if (cleaned.startsWith('(')) {
      return `async ${cleaned}`
    }
    return cleaned
  }

  public writeFile(
    filePath: string,
    content: string,
    options: WriteFileOptions = {}
  ): void {
    const { createDirectories = true, overwrite = true } = options
    if (!overwrite && fs.existsSync(filePath)) {
      throw new Error(`File already exists: ${filePath}`)
    }
    if (createDirectories) {
      const dir = path.dirname(filePath)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
    }
    fs.writeFileSync(filePath, content, 'utf-8')
  }

  public getQueryOutputPath(queryId: string, projectRoot?: string): string {
    const root = projectRoot || process.cwd()
    const queriesDir = path.join(root, 'lib', 'corsair', 'queries')
    return path.join(queriesDir, `${queryId}.ts`)
  }

  public ensureDirectoryExists(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true })
    }
  }
}

export const fileWriteHandler = new FileWriteHandler()
