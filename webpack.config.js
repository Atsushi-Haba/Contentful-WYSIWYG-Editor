module.exports = {
  // メインとなるJavaScriptファイル（エントリーポイント）
  entry: `./src/app.js`,

  // ファイルの出力設定
  output: {
    //  出力ファイルのディレクトリ名
    path: `${__dirname}/dist`,
    // 出力ファイル名
    filename: "app.js"
  }
};