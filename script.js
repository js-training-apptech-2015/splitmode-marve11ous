$(document).ready(function(){
	var selector = ['.cross', '.circle'];
	var field = [[],[],[]];
	var players = ['PLAYER1', 'PLAYER2'];
	var score = [0,0];
	var moveCnt = 0;
	
	$('#P1').text(players[0]);
	$('#P2').text(players[1]);
	
	$('.cell').click(function(){
		if ($(this).attr('class').indexOf('selected')<0)
		{
			$(this).addClass('selected');
			$(this).find(selector[moveCnt%2]).show();
			var x = parseInt($(this).attr('id').replace('cell',''));
			var y = 0;
			while (x>2)
			{
				y++;
				x-=3;
			}
			field[x][y] = moveCnt%2;
			if (checkGameStatus(x,y))
			{
				$('.cell').addClass('selected');
				score[moveCnt%2]+=2;
				setScore();
				$('.modal-title').text(players[moveCnt%2]+' WIN');
				$('#myModal').modal('show');
				return;
			}
			else if(moveCnt===8)
			{
				score[0]++;
				score[1]++;
				setScore();
				$('.modal-title').text('DRAW');
				$('#myModal').modal('show');
				return;
			}
			moveCnt++;
			$('#P1').toggleClass("player");
			$('#P2').toggleClass("player");
		}
	});
	
	$('#nav_newgame').click(function(){
		newGame(true);
	});
	
	$('#modal_new').click(function(){
		newGame(true);
	});
	
	$('#modal_continue').click(function(){
		newGame(false);
	});
	
	function newGame(clearScore)
	{
		$('.game').find(selector[0]).hide();
		$('.game').find(selector[1]).hide();
		$('.cell').removeClass('selected');
		$('#P1').addClass("player");
		$('#P2').removeClass("player");
		field = [[],[],[]];
		moveCnt = 0;
		if (clearScore)
		{
			score = [0,0];
			setScore();
		}
	}
	
	function checkGameStatus(x,y)
	{
		if (field[x][y]===field[(x+1)%3][y] && field[x][y]===field[(x+2)%3][y]) return true;
		if (field[x][y]===field[x][(y+1)%3] && field[x][y]===field[x][(y+2)%3]) return true;
		if ((x+y)%2===0 && field[x][y]===field[(x+1)%3][(y+1)%3] && field[x][y]===field[(x+2)%3][(y+2)%3]) return true;
		return false;
	}
	
	function setScore()
	{
		$('.score > #score_label').text(score[0]+':'+score[1]);
	}
});
