import { ScatterplotLayer } from "@deck.gl/layers";

export class DashedScatterplotLayer extends ScatterplotLayer {
  getShaders() {
    const shaders = super.getShaders();

    shaders.inject = {
      "fs:DECKGL_FILTER_COLOR": `
        float PI = 3.14159265359;
        float angle = atan(geometry.uv.y, geometry.uv.x); 
        float dashPattern = mod(angle * 20.0, PI * 2.0);
        bool isDashed = dashPattern < PI;

        if (!isDashed) {
          discard;
        }
      `,
    };

    return shaders;
  }
}
