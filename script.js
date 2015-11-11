$(document).ready(function(){
	var player = true;
	var s_cross = '.cross';
	var s_circle = '.circle';
	var field = [[],[],[]];
	var players = ['PLAYER1', 'PLAYER2'];
	var score = [0,0];
	var moveCnt = 0;
	
	$('#P1').text(players[0]);
	$('#P2').text(players[1]);
	
	$('.cell').click(function(){
		if ($(this).attr('class').indexOf('selected')<0)
		{
			moveCnt++;
			$(this).addClass('selected');
			$(this).find(player?s_cross:s_circle).show();
			var x = parseInt($(this).attr('id').replace('cell',''));
			var y = 0;
			while (x>2)
			{
				y++;
				x-=3;
			}
			field[x][y] = player;
			if (checkGameStatus(x,y))
			{
				$('.cell').addClass('selected');
				score[player?0:1]+=2;
				setScore();
				$('.modal-title').text(players[player?0:1]+' WIN');
				$('#myModal').modal('show');
				return;
			}
			else if(moveCnt===9)
			{
				score[0]++;
				score[1]++;
				setScore();
				$('.modal-title').text('DRAW');
				$('#myModal').modal('show');
				return;
			}
			player = !player;
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
		$('.game').find(s_cross).hide();
		$('.game').find(s_circle).hide();
		$('.cell').removeClass('selected');
		player = true;
		$('#P1').addClass("player");
		$('#P2').removeClass("player");
		field = [[],[],[]];
		moveCnt = 0;
		if (clearScore)
		{
			score[0] = 0;
			score[1] = 0;
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