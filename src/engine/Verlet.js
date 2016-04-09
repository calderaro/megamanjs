Engine.Verlet = function(components)
{
    if (components !== undefined) {
        this.components = components;
    }
    this.velocity = new THREE.Vector3();
}

Engine.Verlet.prototype.components = ['x', 'y', 'z'];

Engine.Verlet.prototype.integrate = function(position, velocity, deltaTime)
{
    var i = 0, c, com = this.components;
    while (c = com[i++]) {
        position[c] += (this.velocity[c] + velocity[c]) * 0.5 * deltaTime;
        this.velocity[c] = velocity[c];
    }
}

Engine.Verlet.prototype.reset = function()
{
    this.velocity.set(0, 0, 0);
}
