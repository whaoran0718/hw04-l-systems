#version 300 es
precision highp float;

uniform float u_Time;
uniform vec2 u_Dimensions;

in vec4 vs_Pos;
in vec4 vs_Col;
in vec4 vs_MatColumn4;

out vec4 fs_Col;

void main()
{
    fs_Col = vs_Col;

    vec3 pos = vec3(vs_Pos.xy, 1.0);
    float s = 20.0;
    pos.x *= s / u_Dimensions.x;
    pos.x += (vs_MatColumn4.x / u_Dimensions.x) * 2.0 - 1.0;
    pos.y *= -s / u_Dimensions.y;
    pos.y += (vs_MatColumn4.y / u_Dimensions.y) * 2.0 - 1.0;
    
    float offsetX = 0.05 * cos(u_Time * 0.02);
    float offsety = 50.0 * pow(abs(cos(u_Time * 0.02)), 2.0) / u_Dimensions.y;
    pos.x += fract(vs_MatColumn4.w / 2.0) == 0.5 ? offsetX : -offsetX;
    pos.y += offsety;

    gl_Position = vec4(pos.xy, 0.998, 1.0);
}
