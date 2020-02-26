let
  pkgs = import (fetchTarball http://nixos.org/channels/nixpkgs-19.09-darwin/nixexprs.tar.xz) { };
  nodejs = pkgs.nodejs-12_x;

in pkgs.mkShell {
  buildInputs = [
    pkgs.darwin.apple_sdk.frameworks.CoreServices
    pkgs.yarn
    nodejs
  ];
}