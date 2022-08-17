//============================
//登録
//-- 全体 --
var { src, dest, watch, series } = require("gulp");
var plumber = require("gulp-plumber"); //エラー時の強制終了を防止
var notify = require("gulp-notify"); //エラー発生時にデスクトップ通知する
var browserSync = require("browser-sync").create(); //ローカルサーバー
var connectSSI = require("connect-ssi"); //ローカルサーバー内でSSI読み込み

//-- css --
var gulpSass = require("gulp-sass"); //Sassコンパイル
var postcss = require("gulp-postcss"); //autoprefixerとセット
var autoprefixer = require("autoprefixer"); //ベンダープレフィックス付与
// var pxtorem = require("postcss-pxtorem"); //font系rem変換　現在未使用

//-- 画像圧縮 --
// var imagemin = require("gulp-imagemin");
// var imageminJpg = require("imagemin-mozjpeg");
// var imageminPng = require("imagemin-pngquant");
// var imageminGif = require("imagemin-gifsicle");
// var svgmin = require("gulp-svgmin");
// var webp = require("gulp-webp");
//============================

//============================
//ローカルサーバー
function buildServer(done) {
  browserSync.init({
    port: 3080, //サーバーのポート番号指定
    server: {
      baseDir: "./src", //サーバーのルート指定
      middleware: [
        connectSSI({
          baseDir: __dirname + "./src", //SSIのディレクトリ指定
          ext: ".html",
        }),
      ],
    },
    online: true,
  });
  done();
  console.log("server launched!");
}
exports.buildServer = buildServer;
// リロード
function serverReload(done) {
  browserSync.reload();
  done();
  console.log("reload completed!");
}

//============================
// scssのコンパイル
function compileSass() {
  return src(["./src/_dev/scss/**/*.scss", "!./node_modules/**/*.scss"], { sourcemaps: true }) //ファイル指定&ソースマップ準備
    .pipe(
      plumber({ errorHandler: notify.onError("Error: <%= error.message %>") })
    ) //エラーチェック
    .pipe(
      gulpSass({
        outputStyle: "compressed", //expanded, nested, campact, compressedから選択
      })
    )
    .pipe(
      postcss([
        autoprefixer({
          // IEは11以上、Androidは4.4以上
          //設定はpackage.jsonに記述
          cascade: false,
          grid: true,
        }),
      ])
    )
    .pipe(dest("./src/assets/css", { sourcemaps: "../css" }));
}
exports.compileSass = compileSass;

//============================
//監視
function WatchFiles() {
  console.log("start watch!");
  watch("./**/*.scss", series(compileSass, serverReload));
  watch("./**/*.html", series(serverReload));
  watch("./**/*.js", series(serverReload));
}
exports.WatchFiles = WatchFiles;

//============================
// 基本タスク群
exports.default = series(buildServer, WatchFiles, compileSass);

//============================
// 画像圧縮タスク
// function imageMin() {
//   return src("imgMin/src/**/*.+(jpg|jpeg|png|gif)")
//     .pipe(
//       imagemin([
//         imageminPng({
//           quality: [0.7, 0.85],
//         }),
//         imageminJpg(),
//         imageminGif(),
//       ])
//     )

//     .pipe(dest("imgMin/min/"));
// }
// function svgMin() {
//   return src("imgMin/src/**/*.+(svg)")
//     .pipe(svgmin())

//     .pipe(dest("imgMin/min/"));
// }
// function Webp() {
//   return src("imgMin/src/**/*.+(jpg|jpeg|png)")
//     .pipe(webp())
//     .pipe(dest("imgMin/min/"));
// }
// exports.imgMin = series(imageMin, svgMin);
// function Webp() {
//   return src("imgMin/min/**/*.+(jpg|jpeg|png)")
//     .pipe(webp())
//     .pipe(dest("imgMin/webp/"));
// }
// exports.Webp = series(Webp);
