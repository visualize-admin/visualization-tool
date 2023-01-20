let
  pkgs = import <nixpkgs> { };
  nodejs = pkgs.nodejs-16_x;

in pkgs.mkShell {
  buildInputs = [
    pkgs.darwin.apple_sdk.frameworks.CoreServices
    nodejs
    (pkgs.yarn.override {
      nodejs = null;
    })
  ];
}
