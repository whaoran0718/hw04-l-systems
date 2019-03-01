#version 300 es
precision highp float;

uniform float u_Time;

in vec4 fs_Col;
out vec4 out_Col;

void main() {
  out_Col = fs_Col;
}

