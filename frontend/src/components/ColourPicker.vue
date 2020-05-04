<template>
	<div class='colour_picker'>
		<div class='colour_picker__selected_header'>
			<div class='colour_picker__selected_header__text'>Selected colour</div>
			<div
				class='colour_picker__selected'
				:style='{
					"background-color": colour
				}'
			></div>
		</div>
		<div class='colour_picker__selector_divider'>
			<div
				class='colour_picker__palette_picker'
				:style='{
					left: palettePicker.left + "px",
					top: palettePicker.top + "px"
				}'

				@mousedown.prevent.stop='palettePicker.dragging = true'
				@mouseup.prevent.stop='palettePicker.dragging = false; emit()'
			></div>
			<canvas
				class='colour_picker__palette'
				ref='palette'
				:width='dimensions'
				:height='dimensions'
				@click='(e) => { updatePalettePicker(e); emit(); }'
			>
			</canvas>
		</div>

		<div class='colour_picker__selector_divider'>
			<div
				class='colour_picker__hue_picker'
				:style='{
					left: huePicker.left + "px"
				}'

				@mousedown.prevent.stop='huePicker.dragging = true'
				@mouseup.prevent.stop='huePicker.dragging = false; emit();'
			></div>
			<canvas
				class='colour_picker__hue'
				ref='hue'
				:width='dimensions'
				:height='hueHeight'
				@click='(e) => { updateHuePicker(e); emit(); }'
			>
			</canvas>
		</div>
	</div>
</template>

<script>
	export default {
		name: 'ColourPicker',
		props: ['value'],
		data () {
			return {
				dimensions: 100,
				hueHeight: 20,
				palettePicker: {
					left: 0,
					top: 0,
					dragging: false
				},
				huePicker: {
					left: 0,
					dragging: false
				},

				hue_: 0,
				saturation_: 0,
				lightness_: 0
			}
		},
		computed: {
			colour () {
				let hsl = (
					'hsl(' +
					this.hue +
					', ' +
					this.saturation +
					'%, ' +
					this.lightness +
					'%)'
				);

				return hsl;
			},
			hue: {
				get () {
					return this.hue_;
				},
				set (val) {
					this.hue_ = val;
					
					if(!this.$refs.hue) return;
					let width = this.$refs.hue.getBoundingClientRect().width;
					this.huePicker.left  = Math.round((val * width) / 360 - 2);
				}
			},
			saturation: {
				get () {
					return this.saturation_;
				},
				set (val) {
					this.saturation_ = val;
					
					if(!this.$refs.palette) return;
					this.$refs.palette.getBoundingClientRect()
					let width = this.$refs.palette.getBoundingClientRect().width;
					this.palettePicker.left = Math.round((val * width) / 100 - 8);
				}
			},
			lightness: {
				get () {
					return this.lightness_;
				},
				set (val) {
					this.lightness_ = val;

					if(!this.$refs.palette) return;
					let height = this.$refs.palette.getBoundingClientRect().height;
					this.palettePicker.top = Math.round(height - (val * height) / 100 - 8);
				}
			}
		},
		watch: {
			value () {
				let e = document.createElement('span');
				e.style.backgroundColor = this.value;

				let rgbString = e.style.backgroundColor;
				let rgbArray = this.rgbStringToArray(rgbString);
				let hslArray = this.rgbToHsl(rgbArray);

				[this.hue, this.saturation, this.lightness] = hslArray;
				this.drawPalette();
			}
		},
		methods: {
			emit () {
				let e = document.createElement('span');
				e.style.backgroundColor = this.colour;
				this.$emit('input', e.style.backgroundColor);
			},
			drawPalette () {
				const ctx = this.$refs.palette.getContext('2d');

				ctx.clearRect(0, 0, this.dimensions, this.dimensions);


				for(let x = 0; x <= this.dimensions; x++) {
					for(let y = 0; y <= this.dimensions; y++) {
						let saturation = 100 * x / this.dimensions + '%';
						let lightness = 100 * (this.dimensions - y) / this.dimensions + '%';

						ctx.fillStyle = 'hsl(' + this.hue + ', ' + saturation + ', ' + lightness + ')';

						ctx.fillRect(x, y, 1, 1);
					}
				}
			},
			drawHue () {
				const ctx = this.$refs.hue.getContext('2d');

				for(let x = 0; x <= this.dimensions; x++) {
					let angle = (x / this.dimensions * 360);
					ctx.fillStyle = 'hsl(' + angle + ', 100%, 50%)'
					ctx.fillRect(x, 0, 1, this.hueHeight);
				}
			},
			updatePalettePicker (e) {
				//If the canvas is not loaded
				//Or there's no dragging and not a click event
				if(
					!this.$refs.palette ||
					(!this.palettePicker.dragging && e.type !== 'click')
				) return;	

			
				let rect = this.$refs.palette.getBoundingClientRect();

				let left = e.clientX - rect.left - 8;
				let top = e.clientY - rect.top - 8;


				if (e.clientX > rect.right) left = rect.width - 8;
				if (e.clientX < rect.left) left = -8;

				if (e.clientY > rect.bottom) top = rect.height - 8;
				if (e.clientY < rect.top) top = -8;

				this.palettePicker.left = left;
				this.palettePicker.top = top;

				let centerX = left + 8;
				let centerY = top + 8;

				this.saturation_ = Math.round(100 * centerX / rect.width);
				this.lightness_ = Math.round(100 * (rect.height - centerY) / rect.height);
			},
			updateHuePicker (e) {
				//If the canvas is not loaded
				//Or there's no dragging and not a click event
				if(
					!this.$refs.hue ||
					(!this.huePicker.dragging && e.type !== 'click')
				) return;	

			
				let rect = this.$refs.hue.getBoundingClientRect();
				let left = e.clientX - rect.left - 2;

				if (e.clientX > rect.right) left = rect.width - 2;
				if (e.clientX < rect.left) left = -2;

				this.huePicker.left = left;
				this.hue_ = Math.round(360 * (left + 2) / rect.width);
				this.drawPalette();
			},
			//rgb(1,2,3) => [1,2,3]
			rgbStringToArray (str) {
				return str.slice(4, -1).split(',').map(Number);
			},
			//[1,2,3] => [210, 50, 0.8]
			rgbToHsl (rgb) {
				let h, s, l;
				let normalised = rgb.map(v => v / 255);
				let [r, g, b] = normalised;
				let max = Math.max(...normalised);
				let min = Math.min(...normalised);
				
				l = 100 * (max + min) / 2;

				if(max === min) {
					return [this.hue, 0, l];
				} else {
					if(l < 50) {
						s = (max - min) / (max + min);
					} else {
						s = (max - min) / (2 - max - min);
					}

					//Turn into percentage
					s *= 100;
				}

				if(r === max) {
					h = (g - b) / (max - min);
				} else if (g === max) {
					h = 2 + (b - r) / (max - min);
				} else {
					h = 4 + (r - g) / (max - min);
				}
				//Convert to degrees
				h *= 60;

				return [h, s, l].map(v => Math.round(v));
			}
		},
		mounted () {
			this.drawPalette();
			this.drawHue();

			document.addEventListener('mousemove', e => {
				this.updatePalettePicker(e);
				this.updateHuePicker(e);
			})
		}
	}
</script>

<style lang='scss' scoped>
	@import '../assets/scss/variables.scss';

	.colour_picker {
		@at-root #{&}__selected_header {
			display: flex;
			justify-content: space-between;
			align-items: middle;

			@at-root #{&}__text {
				height: 1.5rem;
				line-height: 1.4rem;
				@include user-select(none);
			}
		}

		@at-root #{&}__selected {
			width: 1.5rem;
			height: 1.5rem;
			border: thin solid $color__gray--darkest;
			border-radius: 0.25rem;
			margin-bottom: 0.5rem;
		}

		@at-root #{&}__selector_divider {
			display: flex;
			position: relative;
		}

		@at-root #{&}__palette_picker, #{&}__hue_picker {
			position: absolute;
			background-color: #fff;
			border: thin solid rgba($color__darkgray--darker, 0.5);
			cursor: pointer;
			transition: box-shadow 0.2s;

			&:hover {
				box-shadow: 0 0 1px rgba(black, 0.3);
			}
		}
		@at-root #{&}__palette_picker {
			height: 15px;
			width: 15px;
			border-radius: 100%;
		}
		@at-root #{&}__hue_picker {
			height: 1.75rem;
			width: 5px;
			top: -0.125rem;
			border-radius: 1rem;
		}

		@at-root #{&}__palette, #{&}__hue {
			width: 100%;
			height: 8rem;
			border: thin solid $color__gray--darkest;
			border-radius: 0.25rem;
			margin-bottom: 0.5rem;
		}
		@at-root #{&}__hue {
			height: 1.5rem;
		}
	}
</style>