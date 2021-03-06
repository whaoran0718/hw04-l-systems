#version 300 es

uniform mat4 u_ViewProj;

in vec4 vs_Pos; // Non-instanced; each particle is the same quad drawn in a different place
in vec4 vs_Nor; // Non-instanced, and presently unused
in vec4 vs_Col; // An instanced rendering attribute; each particle instance has a different color
in vec4 vs_MatColumn1;
in vec4 vs_MatColumn2;
in vec4 vs_MatColumn3;
in vec4 vs_MatColumn4;
in vec2 vs_UV; // Non-instanced, and presently unused in main(). Feel free to use it for your meshes.

out vec4 fs_Col;
out vec4 fs_Pos;

float hash(float n) { return fract(sin(n) * 1e4); }
float hash(vec2 p) { return fract(1e4 * sin(17.0 * p.x + p.y * 0.1) * (0.1 + abs(sin(p.y * 13.0 + p.x)))); }

void main()
{
    fs_Col = vs_Col;
    fs_Pos = vs_Pos;

    mat4 transformMat = mat4(vs_MatColumn1, vs_MatColumn2, vs_MatColumn3, vs_MatColumn4);
    vec4 pos = transformMat * vs_Pos;
    gl_Position = u_ViewProj * pos;
}
