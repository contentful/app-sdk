const spawn = require('cross-spawn')
const {
  isCanary,
  restorePackageJson,
  setPackageName,
  PACKAGES,
  MODULE_MAIN_PATH,
  getVersion,
  getTag,
} = require('./shared')

try {
  for (const package of PACKAGES) {
    console.log('')
    console.log(`📦 Deploying package: ${package}`)

    const version = getVersion()
    const tag = getTag(isCanary(version))

    console.log(` > 📝 Updating package name...`)
    setPackageName(package)

    console.log(` > 📚 Publishing ${package} on the registry...`)
    const { status } = spawn.sync('npm', ['publish', '--access', 'public', '--tag', tag], {
      stdio: 'inherit',
      cwd: MODULE_MAIN_PATH,
    })

    if (status !== 0) {
      throw new Error(`Failed to publish ${package}`)
    }

    console.log(`✅ Successfully published ${package}@${getVersion()} on ${tag}!`)
    console.log('')
  }
} catch (err) {
  throw new Error(err)
} finally {
  restorePackageJson()
}
