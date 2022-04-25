# frozen_string_literal: true

file "wasi-vfs" do
  version = "0.1.1"
  filename =
    if ENV["CI"]
      "wasi-vfs-cli-x86_64-unknown-linux-gnu.zip"
    else
      "wasi-vfs-cli-x86_64-apple-darwin.zip"
    end

  `curl -LO "https://github.com/kateinoigakukun/wasi-vfs/releases/download/v#{version}/#{filename}"`
  `unzip #{filename}`
  rm filename
end

file "wasmtime" do
  `curl https://wasmtime.dev/install.sh -sSf | bash`
  cp "#{ENV["HOME"]}/.wasmtime/bin/wasmtime", "wasmtime"
end

file "head-wasm32-unknown-wasi-full-js" do
  require "json"
  version = JSON.parse(File.read("package.json"))["dependencies"]["ruby-head-wasm-wasi"][1..]
  filename = "ruby-head-wasm32-unknown-wasi-full-js.tar.gz"

  `curl -LO https://github.com/ruby/ruby.wasm/releases/download/ruby-head-wasm-wasi-#{version}/#{filename}`
  `tar xfz #{filename}`
  rm filename
end

file "ruby.wasm" => ["head-wasm32-unknown-wasi-full-js"] do
  mv "head-wasm32-unknown-wasi-full-js/usr/local/bin/ruby", "ruby.wasm"
end

file "src/app.wasm" => ["wasi-vfs", "wasmtime", "ruby.wasm", "lib/app.rb"] do
  require "bundler/setup"
  cp_r $:.find { _1.include?("syntax_tree") }, "lib/lib"

  `./wasi-vfs pack ruby.wasm --mapdir /lib::./lib --mapdir /usr::./head-wasm32-unknown-wasi-full-js/usr -o src/app.wasm`
  rm_rf "lib/lib"
end

task default: ["src/app.wasm"]
