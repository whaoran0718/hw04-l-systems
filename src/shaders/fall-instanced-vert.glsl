#version 300 es

uniform mat4 u_ViewProj;
uniform float u_Time;

uniform mat3 u_CameraAxes; // Used for rendering particles as billboards (quads that are always looking at the camera)
// gl_Position = center + vs_Pos.x * camRight + vs_Pos.y * camUp;

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

    float speed = 0.06;
    float noise1 = hash(vs_MatColumn4.y);
    float noise2 = hash(vs_MatColumn4.xz);
    float T = vs_MatColumn4.y / speed;
    float period = T * (noise2 * 3.0 + 25.0);
    float t = period * fract(u_Time / period + noise1);

    float ease_t = 0.02 * period;
    if (t > T + 2.0 * ease_t) {t = 0.0;}
    fs_Col.a = clamp(abs(max(T, t) - T - ease_t) / ease_t, 0.0, 1.0);

    mat4 transformMat = mat4(vs_MatColumn1, vs_MatColumn2, vs_MatColumn3, vs_MatColumn4);
    vec4 pos = transformMat * vs_Pos;
    if (t > T + ease_t) {t = 0.0;};
    pos.y -= min(T, t) * speed;
    gl_Position = u_ViewProj * pos;
}
