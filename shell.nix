let
  pkgs = import <nixpkgs> { };

  # Read the Node.js major version from .nvmrc (e.g. "24" -> pkgs.nodejs_24).
  nvmrc = pkgs.lib.fileContents ./.nvmrc;
  major = pkgs.lib.head (pkgs.lib.splitString "." (pkgs.lib.removePrefix "v" nvmrc));
  nodejs = pkgs."nodejs_${major}";

  yarn = pkgs.yarn;

in
pkgs.mkShell {
  buildInputs = [ nodejs yarn ]
    ++ pkgs.lib.optionals pkgs.stdenv.isDarwin [
      pkgs.darwin.apple_sdk.frameworks.CoreServices
    ];
}