/**
 * SineWaveの3D表示
 */
class SineWave3d {
	constructor(canvas) {
		this.canvas = canvas;
		this.WIDTH = canvas.width;
		this.HEIGHT = canvas.height;
		this.init();

		this.mouse_init();
	}
	
	/**
	 * モデルビュー変換パラメータの初期値
	 */
	init() {
		this.ROTATE_Y = 15;
		this.ROTATE_X = 25;
		this.SCALE = 1.0/1.28;
	}


	/**
	 * 描画メイン
	 */
	draw() {
		var ctx = this.canvas.getContext('2d');
		ctx.fillStyle = '#000000';
		ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
		ctx.fillStyle = '#00ff00';

		var ymin = new Array(this.WIDTH);
		var ymax = new Array(this.WIDTH);

		for(let i = 0; i < this.WIDTH; i++) {
			ymin[i] = this.HEIGHT-1;
			ymax[i] = 0;
		}

		var PRECISION = this.WIDTH/4;//*parseInt(this.SCALE+1);
		var STEP = 2;

		var x, y, z;
		var xx, yy;
		var px, py;

		for(let i = -PRECISION; i <= PRECISION; i++) {
			x = i / PRECISION;
			for(let j = -PRECISION; j <= PRECISION; j++) {
				z = j / PRECISION;
				y = this.sinewave(x, z);
				[xx, yy] = this.rotate(x, y, z);
				[xx, yy] = this.scaling(xx, yy);
				[px, py] = this.viewport(xx, yy);
				if( px >= 0 && py >= 0 ) {
					if(py <= ymin[px] || py >= ymax[px]) {
						if( i % STEP === 0 && j % STEP === 0 ) {
							ctx.fillRect(px, py, 1, 1);
						}
						if(py <= ymin[px]) {
							ymin[px] = py;
						}
						if(py >= ymax[px]) {
							ymax[px] = py;
						}
					}
				}
			}
		}
	}

	/**
	 * 頂点情報
	 */
	sinewave(x, z) {
		// 矩形波合成
		var r = Math.sqrt(x*x + z*z);
		var w = Math.PI * r;
		var y = Math.cos(w) - Math.cos(w*3.0)/3.0 + Math.cos(w*5.0)/5.0;// - Math.cos(w*7.0)/7.0;
		y = y*0.5 + 0.2;
		return y;
	}

	/**
	 * モデルビュー変換
	 */
	rotate(x, y, z) {
		// Y軸回転
		var w1 = Math.PI/180 * this.ROTATE_Y;
		var cosw1 = Math.cos(w1);
		var sinw1 = Math.sin(w1);
		var xx = cosw1 * x - sinw1 * z;
		var zz = sinw1 * x + cosw1 * z;
		// X軸回転
		var w2 = Math.PI/180 * this.ROTATE_X;
		var cosw2 = Math.cos(w2);
		var sinw2 = Math.sin(w2);
		var yy = sinw2 * zz + cosw2 * y;
		return [xx, yy];
	}

	/**
	 * 射影変換(正射影)
	 */
	scaling(x, y) {
		var xx = x * this.SCALE;
		var yy = y * this.SCALE;
		return [xx, yy];
	}

	/*
	 * ビューポート変換
	 */
	viewport(x, y) {
		var px = parseInt( x * this.HEIGHT/2 + this.WIDTH/2);
		var py = parseInt(-y * this.HEIGHT/2 + this.HEIGHT/2);
		return [px, py];
	}


	/**
	 * マウス操作の初期化
	 */
	mouse_init() {
		this.mouse_drag = false;
		this.mouse_x = 0;
		this.mouse_y = 0;

		this.canvas.addEventListener('mousedown', event => {
			if( event.button === 0 ) {
				this.mouse_drag = true;
				this.mouse_x = event.clientX;
				this.mouse_y = event.clientY;
			}
			if( event.button === 1 ) {
				this.init();
				this.draw();
			}
			event.preventDefault();	// ホイールアイコンを表示させない
		});

		this.canvas.addEventListener('mouseup', event => {
			if( event.button === 0 ) {
				this.mouse_drag = false;
			}
			event.preventDefault();
		});

		this.canvas.addEventListener('mousemove', event => {
			if( this.mouse_drag ) {
				if( event.button === 0 ) {
					var dx = (event.clientX - this.mouse_x) * 180.0/this.WIDTH;
					var dy = (event.clientY - this.mouse_y) * 180.0/this.HEIGHT;
					if( this.ROTATE_Y + dx > 5 && this.ROTATE_Y + dx < 85 ) {
						this.ROTATE_Y += dx;
					}
					if( this.ROTATE_X + dy > -60 && this.ROTATE_X + dy < 60 ) {
						this.ROTATE_X += dy;
					}
					this.mouse_x = event.clientX;
					this.mouse_y = event.clientY;
					this.draw();
				}
			}
			event.preventDefault();
		});

		this.canvas.addEventListener('mouseout', event => {
			if( event.button === 0 ) {
				this.mouse_drag = false;
			}
			event.preventDefault();
		});

		this.canvas.addEventListener('wheel', event => {
			if( event.deltaY >= 0 ) {
				if( this.SCALE > 0.5 ) {
					this.SCALE /= 1.1;
				}
			} else {
				if( this.SCALE < 1.5 ) {
					this.SCALE *= 1.1;
				}
			}
			this.draw();
			event.preventDefault();	// ページをスクロールさせない
		});
	}
}


var canvas = document.getElementById('canvas');

var sw3d = new SineWave3d(canvas);
sw3d.draw();
