# Haoran Wei (82926501)

![](display.png)

## Demo
- [Demo Page]()

## Parameter Description
 - generation: The generation or iteration of L-System. The tree grows with rise of the factor.
 To avoid the size exponentially growing, the uniform scale has been adapted.
 - heart_density: Represent the threshold of leaf growth. 0 means no leaves while 1 means no free branch apexes.
 - branch_angle: The upper bound of rotation angle along x axis. The lower bound is proportional to this factor as well.
 - heart/branch/dot_color: Handles of objects' color attribute.

 heart_density:

 ![](leaves.png)

## Techniques
### L-System Branching Structure
The basic shape of the tree is generated from L-system.
```
axiom: FX
rules: F -> FF (20%) or F*$F (80%)
       X -> [FX][*+FX] (30%) or [+FX][*+FX][**+FX](70%)
```
 - F: The current branch moves forward with a random step size.
 - X: Apex of a branch. An apex will be drawn as a spiral slim branch or a heart shape leaf based on a random number.
 - $: Rotate a branch sightly along its local x axis.
 - +: Rotate a branch along its local x axis by an input angle.
 - *: Rotate a branch along its local y axis by around 120 degree.
 - [: Push into a turtle stack. Also means a new branch.
 - ]: Pop out of a turtle stack. Also means the end of current branch.

### Smooth Branches and Junctions
Use a member variable to record the step count of the current turtle. Scale a branch based on its step count using cubic falloff function.
In addtion, instead of steep branch junctions, draw a series of segments to generate smooth curve branches from junctions.

### Instanced Rendering
Draw branches, heart shape leaves and decorations on background canvas using the technique of instanced rendering.
Any Branch is made of a series of short segments with random length and orientation.
Transform matrices are wrapped into a Float32Array together and passed to VBO within 4 vec4 in the form of column vector.
Animation on the background is driven by vertex shader, which avoid repeating update in CPU.

### Falling Leaves
Generate two random factors based on the position of each leaf instance in vertex shader. 
One determines the period of a falling circle, and the another represents the initial phase for animation.
Leaves ease in and out at the beginning and end of lifetime.