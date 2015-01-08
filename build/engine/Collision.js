Engine.Collision = function()
{
    var self = this;
    self.objects = [];
    self.positionCache = {};

    self.detect = function()
    {
        var i, j, o1, o2;
        for (i in self.objects) {
            for (j in self.objects) {
                if (j == i) {
                    continue;
                }
                o1 = self.objects[i];
                o2 = self.objects[j];
                self.findZones(o1, o2);
            }
        }
    }

    self.findZones = function(o1, o2)
    {
        var i, j, z1, z2, dx, dy, distance
        for (i in o1.collision) {
            z1 = o1.collision[i];
            for (j in o2.collision) {
                z2 = o2.collision[j];
                dx = (z1.x + o1.model.position.x + z1.radius) - (z2.x + o2.model.position.x + z2.radius);
                dy = (z1.y + o1.model.position.y + z1.radius) - (z2.y + o2.model.position.y + z2.radius);
                distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < z1.radius + z2.radius) {
                    o1.collides(o2, z1, z2);
                    return;
                }
            }
        }
    }
}
