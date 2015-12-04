$(document).ready(function(){
	var selector = ['.cross', '.circle'];
	var field = [[],[],[]];
	var DEFAULT_PLAYERS = ['PLAYER1', 'PLAYER2', 'YOU'];
	var players = [];
	var score = [0,0];
	var moveCnt = 0;
	
	var network = false;
	var games_url = 'http://aqueous-ocean-2864.herokuapp.com/games/'; 
	var STATES = ['first-player-turn', 'second-player-turn', 'first-player-wins', 'second-player-wins', 'tie'];
	var state;
	var canMove; 
	var player;
	var host;
	
	updatePlayers(DEFAULT_PLAYERS[0], DEFAULT_PLAYERS[1]);
	newGame(true);
	
	$('.cell').click(function(){
		if (!canMove) return;
		if (!$(this).hasClass('selected'))
		{
			$(this).addClass('selected');
			var x = parseInt($(this).attr('id').replace('cell',''));
			if (network)
			{
				canMove = false;
				$.ajax({
					url: games_url+token,
					contentType: 'application/json',
					type: 'PUT',
					data: '{"player": '+player+', "position": '+x+'}'
				}).then(function(response){
					parseResponse(response);
					waitForTurn();
				}, function(){updateState(1)});
			}
			else
			{
				$(this).find(selector[moveCnt%2]).show();
				var y = 0;
				while (x>2)
				{
					y++;
					x-=3;
				}
				field[x][y] = moveCnt%2;
				if (checkGameStatus(x,y))
				{
					finish(moveCnt%2);
					return;
				}
				else if(moveCnt===8)
				{
					finish(-1);
					return;
				}
				moveCnt++;
				$('#P1').toggleClass("player");
				$('#P2').toggleClass("player");
			}
		}
	});
	
	function finish(state)
	{
		if (state<0)
		{
			score[0]++;
			score[1]++;
			setScore();
			$('.modal-title').text('TIE');
		}
		else
		{
			$('.cell').addClass('selected');
			score[state]+=2;
			setScore();
			$('.modal-title').text(players[state]+' WIN');
		}
		if (!host)
		{
			$('#modal_new').hide();
			$('#modal_continue').hide();
			$('#modal_ok').show();
			$('#finishMsg').text('The game is finished.');
		}
		else
		{
			$('#modal_new').show();
			$('#modal_continue').show();
			$('#modal_ok').hide();
			$('#finishMsg').text('The game is finished. Start new game or continue?');
		}
		$('#finishModal').modal('show');
	}
	
	function clearField()
	{
		$('.game').find(selector[0]).hide();
		$('.game').find(selector[1]).hide();
		$('.cell').removeClass('selected');
	}
	
	function newGame(clearScore)
	{
		clearField();
		if (clearScore)
		{
			score = [0,0];
			setScore();
		}
		if (network)
		{
			canMove = false;
			host = true;
			token = null;
			updateState(0);
			$.ajax({
				url: games_url,
				contentType: 'application/json',
				type: 'POST',
				data: '{"type": 0}'
			}).then(function(response){parseResponse(response)}, function(){updateState(1)});
		}
		else
		{
			canMove = true;
			field = [[],[],[]];
			moveCnt = 0;
			$('#P1').addClass("player");
			$('#P2').removeClass("player");
		}
	}

	function updateState(state)
	{
		switch (state) {
		   case STATES[0]: stateMsg = 'Game token: '+token; 
		   		player = 1; canMove=(host===true); 
		   		$('#P1').addClass("player");
		   		$('#P2').removeClass("player");
		   		break;
		   case STATES[1]: stateMsg = 'Game token: '+token; 
		   		player = 2; canMove=(host===false); 
		   		$('#P1').removeClass("player");
		   		$('#P2').addClass("player");
		   		break;
		   case STATES[2]: stateMsg = players[0]+' WIN'; canMove=false; finish(0); break;
		   case STATES[3]: stateMsg = players[1]+' WIN'; canMove=false; finish(1); break;
		   case STATES[4]: stateMsg = 'TIE'; canMove=false; finish(-1); break;
		   case 0: stateMsg = 'Creating new game...'; canMove=false; break;
		   case 1: stateMsg = 'Cannot connect to game server'; canMove=false; break;
		   case 2: stateMsg = 'Incorrect game token'; canMove=false; break;
		   default: stateMsg = 'Bad server response'; canMove=false; break;
		}
		$('#state').text(stateMsg);
		$('#state').css('color', state>0?'red':'black');
	}
	
	function parseResponse(response)
	{
		var json = jQuery.parseJSON(response);
		if (json === null)
		{
			updateState(2);
			$('.cell').addClass('selected');
			return;
		}
		token = json.token;
		state = json.state;
		updateState(state);
		clearField();
		updateField(json.field1, 0);
		updateField(json.field2, 1);
		if (!canMove) $('.cell').addClass('selected');
		
		function updateField(f, selectorIndex)
		{
			var bitField = f.toString(2);
			var id = 0, i = bitField.length;
			while (i--)
			{
				if (bitField[i]==='1') 
				{
					$('#cell'+id).addClass('selected');
					$('#cell'+id).find(selector[selectorIndex]).show();
				}
				id++;
			}
		}
	}
	
	function waitForTurn()
	{
		if (token!==null && !canMove && (state===STATES[0] || state===STATES[1]))
			$.ajax({
				url: games_url+token,
				contentType: 'application/json',
				type: 'GET',
				complete: function() {
					if (!canMove && (state===STATES[0] || state===STATES[1]))
						setTimeout(waitForTurn, 3000);
				}
			}).then(function(response){parseResponse(response)},function(){updateState(1)});
	}
	
	function updatePlayers(p1, p2)
	{
		players[0] = p1;
		players[1] = p2;
		$('#P1').text(players[0]);
		$('#P2').text(players[1]);
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
	
	$('#nav_split').click(function(){
		network = false;
		$('#nav_mode').text('Split');
		updatePlayers(DEFAULT_PLAYERS[0], DEFAULT_PLAYERS[1]);
		newGame(true);
	});
	
	$('#nav_network').click(function(){
		network = true;
		$('#nav_mode').text('Network');
		updatePlayers(DEFAULT_PLAYERS[2], DEFAULT_PLAYERS[1]);
		newGame(true);
	});
	
	$('#nav_newgame').click(function(){
		newGame(true);
	});
	
	$('#nav_connect').click(function(){
		$('#connectModal').modal('show');
	});
	
	$('#modal_connect').click(function(){
		token = $('#game_token').val();
		$.ajax({
			url: games_url+token,
			contentType: 'application/json',
			type: 'GET'
		}).then(function(response){
			host = false;
			network = true;
			$('#nav_mode').text('Network');
			updatePlayers(DEFAULT_PLAYERS[0], DEFAULT_PLAYERS[2]);
			parseResponse(response);
			waitForTurn();
		}, function(){updateState(1)});
	});
	
	$('#modal_new').click(function(){
		newGame(true);
	});
	
	$('#modal_continue').click(function(){
		newGame(false);
	});
});
