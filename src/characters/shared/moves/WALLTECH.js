import {checkForSpecials, checkForAerials, airDrift, fastfall, actionStates} from "physics/actionStateShortcuts";
import {sounds} from "main/sfx";
import {characterSelections,  player} from "main/main";
import {framesData} from 'main/characters';
import {drawVfx} from "main/vfx/drawVfx";
export default {
  name : "WALLTECH",
  canPassThrough : true,
  canGrabLedge : [true,false],
  wallJumpAble : true,
  headBonk : false,
  canBeGrabbed : true,
  landType : 0,
  init : function(p){
    player[p].actionState = "WALLTECH";
    player[p].timer = 0;
    player[p].phys.fastfalled = false;
    player[p].hit.hitstun = 0;
    player[p].phys.kVel.y = 0;
    player[p].phys.kVel.x = 0;
    player[p].phys.cVel.x = 0;
    player[p].phys.cVel.y = 0;
    player[p].phys.intangibleTimer = Math.max(player[p].phys.intangibleTimer,14);
    if (player[p].phys.face == 1){
      drawVfx("tech",player[p].phys.ECBp[3]);
    }
    else {
      drawVfx("tech",player[p].phys.ECBp[1]);
    }
    // draw tech rotated
    actionStates[characterSelections[p]].WALLTECH.main(p);
  },
  main : function(p){
    if (player[p].timer < 1){
      player[p].timer+= 0.15;
      if (player[p].timer > 1){
        player[p].timer = 1;
      }
    }
    else {
      player[p].timer++;
    }
    if (!actionStates[characterSelections[p]].WALLTECH.interrupt(p)){
      if (player[p].timer == 2){
        sounds.walljump.play();
      }
      if (player[p].timer > 0.89 && player[p].timer < 0.91){
        player[p].phys.cVel.x = player[p].phys.face * 0.5;
      }
      if (player[p].timer >= 1){
        fastfall(p);
        airDrift(p);
      }
    }
  },
  interrupt : function(p){
    if (player[p].timer > 1){
      var a = checkForAerials(p);
      var b = checkForSpecials(p);
      if (a[0]){
        actionStates[characterSelections[p]][a[1]].init(p);
        return true;
      }
      else if ((player[p].inputs.l[0] && !player[p].inputs.l[1]) || (player[p].inputs.r[0] && !player[p].inputs.r[1])){
        actionStates[characterSelections[p]].ESCAPEAIR.init(p);
        return true;
      }
      else if (((player[p].inputs.x[0] && !player[p].inputs.x[1]) || (player[p].inputs.y[0] && !player[p].inputs.y[1]) || (player[p].inputs.lsY[0] > 0.7 && player[p].inputs.lsY[1] <= 0.7)) && (!player[p].phys.doubleJumped || (player[p].phys.jumpsUsed < 5 && player[p].charAttributes.multiJump))){
        if (player[p].inputs.lsX[0]*player[p].phys.face < -0.3){
          actionStates[characterSelections[p]].JUMPAERIALB.init(p);
        }
        else {
          actionStates[characterSelections[p]].JUMPAERIALF.init(p);
        }
        return true;
      }
      else if (b[0]){
        actionStates[characterSelections[p]][b[1]].init(p);
        return true;
      }
      else if (player[p].timer > framesData[characterSelections[p]].WALLTECH){
        actionStates[characterSelections[p]].FALL.init(p);
        return true;
      }
      else {
        return false;
      }
    }
    else {
      return false;
    }
  }
};

