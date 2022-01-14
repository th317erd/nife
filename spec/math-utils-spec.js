const Nife = require('../src');

describe("Utils", function() {
  it('should be able to linearly interpolate', function() {
    expect(Nife.lerp(-1, 1, 0.0)).toEqual(-1);
    expect(Nife.lerp(-1, 1, 0.5)).toEqual(0);
    expect(Nife.lerp(-1, 1, 1.0)).toEqual(1);

    expect(Nife.lerp(1, -1, 0.0)).toEqual(1);
    expect(Nife.lerp(1, -1, 0.5)).toEqual(0);
    expect(Nife.lerp(1, -1, 1.0)).toEqual(-1);

    expect(Nife.lerp(0, 10, 0.2)).toEqual(2);
    expect(Nife.lerp(0, 10, 0.5)).toEqual(5);
    expect(Nife.lerp(0, 10, 0.7)).toEqual(7);
    expect(Nife.lerp(0, 10, 1.0)).toEqual(10);
  });

  it('should be able to clamp', function() {
    expect(Nife.clamp(1, 0, 5)).toEqual(1);
    expect(Nife.clamp(-1, 0, 5)).toEqual(0);
    expect(Nife.clamp(-1, 5, 0)).toEqual(0);
    expect(Nife.clamp(6, 5, 0)).toEqual(5);
    expect(Nife.clamp(6, -10, -5)).toEqual(-5);
    expect(Nife.clamp(-6, -10, -5)).toEqual(-6);
    expect(Nife.clamp(-11, -10, -5)).toEqual(-10);
  });

  it('should be able to snap to a grid', function() {
    // Floor
    expect(Nife.snapToGrid(-101,  100, Math.floor)).toEqual(-200);
    expect(Nife.snapToGrid(-99,   100, Math.floor)).toEqual(-100);
    expect(Nife.snapToGrid(-10,   100, Math.floor)).toEqual(-100);
    expect(Nife.snapToGrid(0,     100, Math.floor)).toEqual(0);
    expect(Nife.snapToGrid(99,    100, Math.floor)).toEqual(0);
    expect(Nife.snapToGrid(199,   100, Math.floor)).toEqual(100);
    expect(Nife.snapToGrid(201,   100, Math.floor)).toEqual(200);

    // Round
    expect(Nife.snapToGrid(-151,  100, Math.round)).toEqual(-200);
    expect(Nife.snapToGrid(-150,  100, Math.round)).toEqual(-100);
    expect(Nife.snapToGrid(-10,   100, Math.round)).toEqual(-0);
    expect(Nife.snapToGrid(0,     100, Math.round)).toEqual(0);
    expect(Nife.snapToGrid(99,    100, Math.round)).toEqual(100);
    expect(Nife.snapToGrid(149,   100, Math.round)).toEqual(100);
    expect(Nife.snapToGrid(150,   100, Math.round)).toEqual(200);

    // Ceiling
    expect(Nife.snapToGrid(-151,  100, Math.ceil)).toEqual(-100);
    expect(Nife.snapToGrid(-150,  100, Math.ceil)).toEqual(-100);
    expect(Nife.snapToGrid(-10,   100, Math.ceil)).toEqual(-0);
    expect(Nife.snapToGrid(0,     100, Math.ceil)).toEqual(0);
    expect(Nife.snapToGrid(99,    100, Math.ceil)).toEqual(100);
    expect(Nife.snapToGrid(149,   100, Math.ceil)).toEqual(200);
    expect(Nife.snapToGrid(151,   100, Math.ceil)).toEqual(200);

    // Offset
    expect(Nife.snapToGrid(-151,  100, Math.round, 10)).toEqual(-110);
    expect(Nife.snapToGrid(-150,  100, Math.round, 10)).toEqual(-110);
    expect(Nife.snapToGrid(-10,   100, Math.round, 10)).toEqual(-10);
    expect(Nife.snapToGrid(0,     100, Math.round, 10)).toEqual(-10);
    expect(Nife.snapToGrid(99,    100, Math.round, 10)).toEqual(90);
    expect(Nife.snapToGrid(149,   100, Math.round, 10)).toEqual(190);
    expect(Nife.snapToGrid(150,   100, Math.round, 10)).toEqual(190);
  });
});
