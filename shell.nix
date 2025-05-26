let
  pkgs = import <nixpkgs> { };
  nodejs = pkgs.nodejs-22_x;

in pkgs.mkShell {
  buildInputs = [
    pkgs.darwin.apple_sdk.frameworks.CoreServices
    nodejs
  ];
}