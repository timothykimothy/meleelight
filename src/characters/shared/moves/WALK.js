import {tiltTurnDashBuffer, checkForTiltTurn, checkForSmashTurn, checkForDash, checkForSquat, checkForJump,
    checkForSmashes
    , checkForTilts
    , checkForSpecials
    , reduceByTraction
    , actionStates
} from "physics/actionStateShortcuts";
import {sounds} from "main/sfx";
import {characterSelections, player} from "main/main";
import {framesData} from 'main/characters';
export default {
  name : "WALK",
  canEdgeCancel : true,
  canBeGrabbed : true,
  init : function(p,addInitV){
    player[p].actionState = "WALK";
    player[p].timer = 1;
    if (addInitV){
      const tempInit = player[p].charAttributes.walkInitV * player[p].phys.face;
      if ((tempInit > 0 && player[p].phys.cVel.x < tempInit) || (tempInit < 0 && player[p].phys.cVel.x > tempInit)){
        player[p].phys.cVel.x += player[p].charAttributes.walkInitV * player[p].phys.face;
      }
    }
    actionStates[characterSelections[p]].WALK.main(p);
  },
  main : function(p){
    if (!actionStates[characterSelections[p]].WALK.interrupt(p)){
      const footstep = [false, false];
      if (player[p].timer < 5){
        footstep[0] = true;
      }
      if (player[p].timer < 15){
        footstep[1] = true;
      }

      //Current Walk Acceleration = ((MaxWalkVel * Xinput) - PreviousFrameVelocity) * (1/(MaxWalkVel * 2)) * (InitWalkVel * WalkAcc)
      const tempMax = player[p].charAttributes.walkMaxV * player[p].inputs.lsX[0];

      if (Math.abs(player[p].phys.cVel.x) > Math.abs(tempMax)){
        reduceByTraction(p, true);
      }
      else {
        const tempAcc = (tempMax - player[p].phys.cVel.x) * (1/(player[p].charAttributes.walkMaxV*2)) * (player[p].charAttributes.walkInitV + player[p].charAttributes.walkAcc);

        player[p].phys.cVel.x += tempAcc;
        if (player[p].phys.cVel.x * player[p].phys.face > tempMax * player[p].phys.face){
          player[p].phys.cVel.x = tempMax;
        }
      }

      const time = (player[p].phys.cVel.x * player[p].phys.face) / player[p].charAttributes.walkMaxV;
      if (time > 0){
        player[p].timer += time;
      }
      if ((footstep[0] && player[p].timer >= 5) || (footstep[1] && player[p].timer >= 15)){
        sounds.footstep.play();
      }
    }
  },
  interrupt : function(p){
    const b = checkForSpecials(p);
    const t = checkForTilts(p);
    const s = checkForSmashes(p);
    const j = checkForJump(p);
    if (player[p].timer > framesData[characterSelections[p]].WALK){
      actionStates[characterSelections[p]].WALK.init(p,false);
      return true;
    }
    if (player[p].inputs.lsX[0] === 0){
      actionStates[characterSelections[p]].WAIT.init(p);
      return true;
    }
    else if (j[0]){
      actionStates[characterSelections[p]].KNEEBEND.init(p,j[1]);
      return true;
    }
    else if (player[p].inputs.l[0] || player[p].inputs.r[0]){
      actionStates[characterSelections[p]].GUARDON.init(p);
      return true;
    }
    else if (player[p].inputs.lA[0] > 0 || player[p].inputs.rA[0] > 0){
      actionStates[characterSelections[p]].GUARDON.init(p);
      return true;
    }
    else if (b[0]){
      actionStates[characterSelections[p]][b[1]].init(p);
      return true;
    }
    else if (s[0]){
      actionStates[characterSelections[p]][s[1]].init(p);
      return true;
    }
    else if (t[0]){
      actionStates[characterSelections[p]][t[1]].init(p);
      return true;
    }
    else if (checkForSquat(p)){
      actionStates[characterSelections[p]].SQUAT.init(p);
      return true;
    }
    else if (checkForDash(p)){
      actionStates[characterSelections[p]].DASH.init(p);
      return true;
    }
    else if (checkForSmashTurn(p)){
      actionStates[characterSelections[p]].SMASHTURN.init(p);
      return true;
    }
    else if (checkForTiltTurn(p)){
      player[p].phys.dashbuffer = tiltTurnDashBuffer(p);
      actionStates[characterSelections[p]].TILTTURN.init(p);
      return true;
    }
    else {
      return false;
    }
  }
};
