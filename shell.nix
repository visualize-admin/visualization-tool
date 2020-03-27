let
  pkgs = import <nixpkgs> { };
  nodejs = pkgs.nodejs-12_x;

in pkgs.mkShell {
  buildInputs = [
    pkgs.darwin.apple_sdk.frameworks.CoreServices
    pkgs.yarn
    nodejs
  ];
}