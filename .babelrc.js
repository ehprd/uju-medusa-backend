let ignore = [`**/dist`]

// Jest needs to compile this code, but generally we don't want this copied
// to output folders
if (process.env.NODE_ENV !== `test`) {
    ignore.push(`**/__tests__`)
}

module.exports = {
    presets: [["babel-preset-medusa-package"], ["@babel/preset-env"], ["@babel/preset-typescript"]],
    plugins: [
        ["@babel/plugin-proposal-decorators", { "version": "legacy" }],
        ["@babel/plugin-transform-class-properties", { "loose": true }],
        ["@babel/plugin-transform-private-methods", { "loose": true }],
        ["@babel/plugin-transform-private-property-in-object", { "loose": true }]
    ],
    ignore,
}
