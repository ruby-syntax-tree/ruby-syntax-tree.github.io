# ruby-syntax-tree.github.io

This repository contains the code that backs [ruby-syntax-tree.github.io](https://ruby-syntax-tree.github.io). It is an interactive editor that is running [Syntax Tree](https://github.com/ruby-syntax-tree/syntax_tree) in the background to handle introspecting the underlying syntax tree and formatting. It uses Ruby's WASI bindings to do this all in the browser.

## Getting started

To run the application locally, you should:

* `bundle install` to install the Ruby dependencies.
* `yarn install` to install the node dependencies.
* `bundle exec rake` to build the `.wasm` application file.
* `yarn serve` to start the local development server.
* Open a browser at `localhost:8000`.

## Contributing

Bug reports and pull requests are welcome on GitHub at https://github.com/ruby-syntax-tree/syntax_tree.

## License

The repository is available as open source under the terms of the [MIT License](https://opensource.org/licenses/MIT).
