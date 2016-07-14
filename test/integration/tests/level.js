'use strict';

const expect = require('expect.js');
const sinon = require('sinon');

const env = require('../../env');
const AudioContextMock = require('../../mocks/audiocontext-mock');
const WebGLRendererMock = require('../../mocks/webglrenderer-mock');
const RequestAnimationFrameMock = require('../../mocks/requestanimationframe-mock');
const Object = env.Engine.Object;
const Level = env.Game.scenes.Level;

describe('Level', function() {
  function createLevel() {
      AudioContextMock.mock();
      WebGLRendererMock.mock();
      RequestAnimationFrameMock.mock();
      const level = new Level();
      const game = new Game();
      const character = new Object;
      character.applyTrait(new Game.traits.Health);
      character.applyTrait(new Game.traits.Teleport);
      game.player.setCharacter(character);
      level.events.trigger(level.EVENT_CREATE, [game]);;
      AudioContextMock.clean();
      WebGLRendererMock.clean();
      RequestAnimationFrameMock.clean();
      return level;
  }

  it('should decrease player lives if player dies', function() {
    const level = createLevel();
    level.world.addObject(level.player.character);
    level.player.lives = 3;
    level.player.character.health.kill();
    expect(level.player.lives).to.equal(2);
  });

  it('should run resetPlayer 4 seconds after death if lives > 1', function(done) {
    const level = createLevel();
    sinon.stub(level, 'resetPlayer', function() {
      try {
        expect(level.world._timeTotal).to.be(4);
        done();
      } catch (e) {
        done(e);
      }
    });
    level.world.addObject(level.player.character);
    level.player.lives = 2;
    level.player.character.health.kill();
    level.world.updateTime(3.999);
    level.world.updateTime(0.001);
  });

  it('should emit end event 4 seconds after death if lives <= 1', function() {
    const level = createLevel();
    const endEventSpy = sinon.spy(function() {
      try {
        expect(level.timer._timeTotal).to.be(4);
        done();
      } catch (e) {
        done(e);
      }
    });
    level.events.bind(level.EVENT_END, endEventSpy);
    level.world.addObject(level.player.character);
    level.player.lives = 1;
    level.player.character.health.kill();
    level.world.updateTime(3.999);
    level.world.updateTime(0.001);
  });

  describe('#resetPlayer()', function() {
    it('should put player on last checkpoint + offset', function() {
      const level = createLevel();
      level.checkPointOffset.set(0, 200);
      level.addCheckPoint(135, 345, 0);
      level.addCheckPoint(1243, 1211, 0);
      level.addCheckPoint(7465, 2345, 0);
      level.checkPointIndex = 0;
      level.resetPlayer();
      expect(level.player.character.position).to.eql({x: 135, y: 545, z: 0});
      level.checkPointIndex = 2;
      level.resetPlayer();
      expect(level.player.character.position).to.eql({x: 7465, y: 2545, z: 0});
      level.checkPointIndex = 1;
      level.resetPlayer();
      expect(level.player.character.position).to.eql({x: 1243, y: 1411, z: 0});
    });

    it('should activate a teleportation from checkpoint + offset', function(done) {
      const level = createLevel();
      level.checkPointOffset.set(0, 200);
      level.readyBlinkTime = 0;
      level.addCheckPoint(300, 100, 0);
      level.player.character.events.bind(level.player.character.teleport.EVENT_START, () => {
        try {
          expect(level.player.character.position).to.eql({x: 300, y: 300, z: 0 });
          done();
        } catch (e) {
          done(e);
        }
      });
      level.resetPlayer();
      level.world.updateTime(0);
    });

    it('should teleport to checkpoint', function(done) {
      const level = createLevel();
      level.checkPointOffset.set(0, 200);
      level.readyBlinkTime = 0;
      level.addCheckPoint(300, 100, 0);
      level.player.character.events.bind(level.player.character.teleport.EVENT_END, () => {
        try {
          expect(level.player.character.position).to.eql({x: 300, y: 100, z: 0 });
          done();
        } catch (e) {
          done(e);
        }
      });
      level.resetPlayer();

      setTimeout(function() {
        level.world.updateTime(1);
      }, 0);
    });
  });
});
