let
  pkgs = import <nixpkgs> {};
  nodejs = pkgs.nodejs-12_x;

in pkgs.mkShell {
  buildInputs = [
    nodejs
  ];
}