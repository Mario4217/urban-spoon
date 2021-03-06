uiEntAlpha = 0;

function drawUI(){

  ctx.font = "24px Verdana";

  //placement text
  if (placement != null){
    drawPlacement(mouseX,mouseH,placement.sprite);
    ctx.fillStyle = "#ffffff";
    ctx.textBaseline="top";
    ctx.fillText(placement.text,10,96);
    if (keyCheckPressed("M0")){
      socket.emit('place',{x: mouseX, y: 0, type: placement.type});
      placement = null;
    }
  }

  //team info
  ctx.globalAlpha = 1;
  var x = 0;
  var y = 0;
  ctx.font = "24px Verdana";
  ctx.textBaseline="top";
  ctx.fillStyle = teamColors[myTeam.id];
  ctx.fillText(teamNames[myTeam.id],x,y);
  ctx.fillStyle = "#ffffff";
  ctx.fillText("Energy: "+myTeam.energy+(myTeam.maxEnergy == null ? "" : " / "+myTeam.maxEnergy),x,y+32);
  ctx.fillText("Units: "+myTeam.units+" / "+myTeam.maxUnits,x,y+64);
  ctx.textAlign = "center";
  var time = new Date() - startTime;
  var seconds = Math.floor(time / 1000);
  ctx.fillText(Math.floor(seconds / 60)+":"+((seconds % 60) < 10 ? "0": "")+(seconds % 60), window.innerWidth/2, 10);
  ctx.textAlign = "left";

  ctx.globalAlpha = uiEntAlpha;
  ctx.fillStyle = "#232323";
  switch (entUIPosition){
    case "top":
      ctx.fillRect(0,0,canvas.width,64);
      if (mouseOverUI(0,0,canvas.width,64)){preventSelect = true};
    break;
    case "left":
      ctx.fillRect(0,0,256,canvas.height);
       if (mouseOverUI(0,0,256,canvas.height)){preventSelect = true};
    break;
    case "bottom":
      ctx.fillRect(0,canvas.height-64,canvas.width,64);
      if (mouseOverUI(0,canvas.height-64,canvas.width,canvas.height)){preventSelect = true};
    break;
  }

  //entity selected
  if (selectedEntUI != null){
    switch (entUIPosition){
      case "top":
        var x = 10;
        var y = 0;
      break;
      case "left":
        var x = 10;
        var y = 0;
      break;
      case "bottom":
        var x = 10;
        var y = canvas.height-64;
      break;
    }

    function nextBlock(){
      switch (entUIPosition){
        case "top":
          x += 256;
          y = 0;
        break;
        case "left":
          x = 0;
          y += 64;
        break;
        case "bottom":
          x += 256;
          y = canvas.height-64;
        break;
      }
    }

    uiEntAlpha = transitionLinear(uiEntAlpha,1,0.1);
    //ctx.font = "24px Verdana";
    ctx.textBaseline="top";
    ctx.fillStyle = teamColors[selectedEnt.team];
    ctx.fillText(teamNames[selectedEnt.team],x,y);
    nextBlock();
    ctx.fillStyle = "#ffffff";
    ctx.fillText(selectedEntUI.name,x,y);
    ctx.fillText("HP: "+selectedEntUI.hp+" / "+selectedEntUI.hpMax,x,y+32);
    nextBlock();
    for (var i=0; i<selectedEntUI.options.length; i++){
      var option = selectedEntUI.options[i];
      if (option.type == "vehicle"){
        ctx.fillStyle = "#00ffff";
      }
      else if (option.type == "ability"){
        ctx.fillStyle = "#00ff00";
      }else if (option.type == "build"){
        ctx.fillStyle = "#f4d742";
      }

      //hover animation for options
      if (mouseOverUI(x,y,x+256,y+64,option)){
        option.hoverFrame = transitionLinear(option.hoverFrame,1,0.1);
        if (keyCheckReleased("M0")){//left click on option
          currentAction = option;
          currentAction.index = i;
          if (currentAction.client == "click"){
            socket.emit('a',{index: i, extra: {}});
            currentAction = null;
          }
        }
        if (keyCheckPressed("M2") && option.auto){//right click on option
          if (selectedEnt.auto){
            selectedEnt.auto = false;
          }else{
            selectedEnt.auto = true;
          }
          socket.emit('auto',{index: i, auto: selectedEnt.auto});
        }
      }else{
        option.hoverFrame = transitionLinear(option.hoverFrame,0,0.1);
      }
      
      ctx.globalAlpha = 0.2 + option.hoverFrame*0.7;
      ctx.fillRect(x,y,256,64);
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#000000";
      ctx.fillText(option.name,x+2,y+2);
      if (option.costs != 0){
        ctx.fillText(option.costs,x+2,y+32);
      }
      if (option.auto){
        ctx.fillStyle = selectedEnt.auto ? "#00ff00": "#ff0000";
        ctx.fillRect(x,y+32,128,32);
        ctx.fillStyle = "#000000";
        ctx.fillText("Auto: "+(selectedEnt.auto ? "on" : "off"),x+2,y+32);
      }

      if (option.type == "vehicle"){
        drawSpriteUI(x+256-32,y,"sprites/ui/iconVehicle.png");
      }else if (option.type == "ability"){
        drawSpriteUI(x+256-32,y,"sprites/ui/iconEffect.png");
      }else if (option.type == "build"){
        drawSpriteUI(x+256-32,y,"sprites/ui/iconBuild.png");
      }

      var timer = selectedEnt.timers[i];
      if (timer != undefined){
        if (timer.m > 0){
          var per = Math.max(timer.t,0) / timer.m;
          ctx.fillStyle = "#0000ff";
          ctx.fillRect(x,y+48,256*per,16);
        }
      }

      nextBlock();

    }
  }else{
    uiEntAlpha = transitionLinear(uiEntAlpha,0,0.1);
  }
  ctx.globalAlpha = 1;
}

function transitionLinear(current,target,step){
   if( Math.abs(current-target)<step){return target}
   return current + Math.sign(target-current)*step;
}

function drawSpriteUI(x,y,sprite){
  if (sprites[sprite] == undefined){
    sprites[sprite] = new Image();
    sprites[sprite].src = sprite;
  }
  ctx.drawImage(sprites[sprite],x,y);
}