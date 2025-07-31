#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

// Colores para la consola
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m',
}

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function findDependencies(componentName) {
  log('cyan', `🔍 Buscando dependencias para: ${componentName}`)
  console.log('')

  try {
    // Buscar imports del componente
    log('yellow', '📥 Imports del componente:')
    try {
      const imports = execSync(
        `grep -r "import.*${componentName}" . --include="*.tsx" --include="*.ts"`,
        { encoding: 'utf8' }
      )
      if (imports.trim()) {
        console.log(imports)
      } else {
        log('red', '   No se encontraron imports')
      }
    } catch (error) {
      log('red', '   No se encontraron imports')
    }
    console.log('')

    // Buscar usos del componente en JSX
    log('yellow', '🎯 Usos del componente en JSX:')
    try {
      const jsxUses = execSync(
        `grep -r "<${componentName}" . --include="*.tsx" --include="*.ts"`,
        { encoding: 'utf8' }
      )
      if (jsxUses.trim()) {
        console.log(jsxUses)
      } else {
        log('red', '   No se encontraron usos en JSX')
      }
    } catch (error) {
      log('red', '   No se encontraron usos en JSX')
    }
    console.log('')

    // Buscar en tests
    log('yellow', '🧪 Tests relacionados:')
    try {
      const tests = execSync(
        `find . -name "*.test.tsx" -exec grep -l "${componentName}" {} \\;`,
        { encoding: 'utf8' }
      )
      if (tests.trim()) {
        console.log(tests)
      } else {
        log('red', '   No se encontraron tests')
      }
    } catch (error) {
      log('red', '   No se encontraron tests')
    }
    console.log('')

    // Buscar tipos relacionados
    log('yellow', '📝 Tipos relacionados:')
    try {
      const types = execSync(
        `grep -r "interface.*${componentName}\\|type.*${componentName}" . --include="*.tsx" --include="*.ts"`,
        { encoding: 'utf8' }
      )
      if (types.trim()) {
        console.log(types)
      } else {
        log('red', '   No se encontraron tipos')
      }
    } catch (error) {
      log('red', '   No se encontraron tipos')
    }
    console.log('')

    // Buscar en server actions
    log('yellow', '⚡ Server Actions relacionados:')
    try {
      const actions = execSync(
        `find . -path "*/actions/*" -name "*.ts" -exec grep -l "${componentName}" {} \\;`,
        { encoding: 'utf8' }
      )
      if (actions.trim()) {
        console.log(actions)
      } else {
        log('red', '   No se encontraron server actions')
      }
    } catch (error) {
      log('red', '   No se encontraron server actions')
    }
    console.log('')
  } catch (error) {
    log('red', '❌ Error al buscar dependencias')
    console.error(error)
  }
}

function findTypeDependencies(typeName) {
  log('cyan', `🔍 Buscando dependencias para el tipo: ${typeName}`)
  console.log('')

  try {
    // Buscar definición del tipo
    log('yellow', '📝 Definición del tipo:')
    try {
      const definition = execSync(
        `grep -r "interface.*${typeName}\\|type.*${typeName}" . --include="*.tsx" --include="*.ts"`,
        { encoding: 'utf8' }
      )
      if (definition.trim()) {
        console.log(definition)
      } else {
        log('red', '   No se encontró la definición')
      }
    } catch (error) {
      log('red', '   No se encontró la definición')
    }
    console.log('')

    // Buscar usos del tipo
    log('yellow', '🎯 Usos del tipo:')
    try {
      const uses = execSync(
        `grep -r "${typeName}" . --include="*.tsx" --include="*.ts"`,
        { encoding: 'utf8' }
      )
      if (uses.trim()) {
        console.log(uses)
      } else {
        log('red', '   No se encontraron usos')
      }
    } catch (error) {
      log('red', '   No se encontraron usos')
    }
    console.log('')
  } catch (error) {
    log('red', '❌ Error al buscar dependencias del tipo')
    console.error(error)
  }
}

function showHelp() {
  log('green', '🔧 Script de Búsqueda de Dependencias')
  console.log('')
  log('yellow', 'Uso:')
  console.log(
    '  node scripts/find-dependencies.js component <nombre-del-componente>'
  )
  console.log('  node scripts/find-dependencies.js type <nombre-del-tipo>')
  console.log('')
  log('yellow', 'Ejemplos:')
  console.log(
    '  node scripts/find-dependencies.js component MatchCalendarMobile'
  )
  console.log('  node scripts/find-dependencies.js type MatchEvent')
  console.log('')
  log('yellow', 'Funcionalidades:')
  console.log('  - Busca imports del componente')
  console.log('  - Busca usos en JSX')
  console.log('  - Busca tests relacionados')
  console.log('  - Busca tipos relacionados')
  console.log('  - Busca en server actions')
  console.log('')
}

function main() {
  const args = process.argv.slice(2)

  if (args.length < 2) {
    showHelp()
    return
  }

  const [command, name] = args

  if (command === 'component') {
    findDependencies(name)
  } else if (command === 'type') {
    findTypeDependencies(name)
  } else {
    log('red', '❌ Comando no válido')
    showHelp()
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main()
}

module.exports = {
  findDependencies,
  findTypeDependencies,
}
