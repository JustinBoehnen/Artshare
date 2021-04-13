<!--Justin Boehnen 2021-->
<script>
    import { createEventDispatcher } from 'svelte';
    import { user, logged_in } from '../../stores/auth-store'
    import RangeSlider from 'svelte-range-slider-pips'

    export let loadingOn
    export let loadingOff
    export let pbn_name = ""
    export let pbn_tags = ""
    export let src_img
    export let palette
    export let published
    //export let pbn_name
    //export let pbn_tags

    const dispatch = createEventDispatcher()
    var generation_complete
    var quantized, outlined, swatch

    //generation options
    var complexity
    var line_thickness
    var line_color = "#aaaaaa"
    var use_numbers = true
    var number_size
    var number_color = "#000000"
    var advanced_options = false
    var bg_color = "#ffffff"
    var smoothing = 2
    var cleanup_iterations = 5
    var cleanup_intensity = 10
    var minimum_labeled_region = 40

    //onMount = () => {
    //    generation_complete = false
    //}

    const scale = (num, in_min, in_max, out_min, out_max) => {
        return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
    }

    const hexToRgb = (hex) => {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? [
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16)
        ] : null;
    }

    const handleGenerate = () => {
        var blur_rad

        if(!advanced_options)
            blur_rad = Math.round(scale(complexity, 1, 10, 30, 5))
        else{
            if(smoothing > 100) smoothing = 100
            else if (smoothing < 1) smoothing = 1
            blur_rad = Math.round(scale(smoothing, 1, 100, 100, 1))
        }

        if(cleanup_iterations < 0) cleanup_iterations = 0
        else if (cleanup_iterations > 30) cleanup_iterations = 30

        if(cleanup_intensity < 1) cleanup_intensity = 1
        else if (cleanup_intensity > 100) cleanup_intensity = 100

        if(minimum_labeled_region < 1) minimum_labeled_region = 1

        const quantize_args = {
            quantize_args: {
                image_src: src_img.src,
                palette: palette,
                blur_radius: blur_rad,
                cleanup_iterations: cleanup_iterations,
                cleanup_radius: cleanup_intensity
            },
            outline_args: {
                use_outlines: false
            },
            number_args: {
                use_numbers: false
            }
        }

        const outline_args = {
            quantize_args: {
                image_src: src_img.src,
                palette: palette,
                blur_radius: blur_rad,
                cleanup_iterations: cleanup_iterations,
                cleanup_radius: cleanup_intensity
            },
            outline_args: {
                use_outlines: true,
                line_thickness: line_thickness,
                line_color: hexToRgb(line_color),
                use_bg: true,
                bg_color: hexToRgb(bg_color),
            },
            number_args: {
                use_numbers: use_numbers,
                cell_size: 1,
                region_threshold: minimum_labeled_region,
                font_color: hexToRgb(number_color),
                font_size: number_size
            }
        }

        outline_args

        loadingOn()
        generation_complete = false
        var f_done = false, o_done = false, s_done = false

        quantizeImage(quantize_args).then(completed_src => {
            quantized = completed_src
            f_done = true

            if(f_done && o_done && s_done){
                generation_complete = true
                loadingOff()
            }
        })

        quantizeImage(outline_args).then(number_src => {
            outlined = number_src
            o_done = true

            if(f_done && o_done && s_done){
                generation_complete = true
                loadingOff()
            }
        })

        swatchImage(palette).then(swatch_src => {
            swatch = swatch_src
            s_done = true

            if(f_done && o_done && s_done){
                generation_complete = true
                loadingOff()
            }
        })
        
        
    }

    const quantizeImage = (body) => {
        return new Promise((resolve) => {

            fetch(`http://localhost:3000/designer/quantize.json`, {
                method: 'POST',
                body: JSON.stringify(body),
                headers: {
                    'Content-Type': 'application/json',
                },
            }).then(response => {
                response.blob().then(blob => {
                    var reader = new FileReader()
                    reader.readAsDataURL(blob)
                    reader.onload = (e) => {
                        resolve(e.target.result)
                    }
                })
            })
        })
	}

    const swatchImage = (palette) => {
        const body = {
            palette
        }

        return new Promise((resolve) => {
            fetch(`http://localhost:3000/designer/swatch.json`, {
                method: 'POST',
                body: JSON.stringify(body),
                headers: {
                    'Content-Type': 'application/json',
                },
            }).then(response => {
                response.blob().then(blob => {
                    var reader = new FileReader()
                    reader.readAsDataURL(blob)
                    reader.onload = (e) => {
                        resolve(e.target.result)
                    }
                })
            })
        })
	}

    function ParseTags() { 
		if (pbn_tags != '') {
			return pbn_tags
				.split(' ')
				.join('')
				.split(',')
				.map((t) => t.toLowerCase())
		}

		return []
	}

    const validateForm = () => {
        var err = false
        var errstr = "Form Error!"
        if(!/\S/.test(pbn_name)){
            err = true
            errstr += "\n> A valid name must be provided before proceeding"
        }
        if(err){
            alert(errstr)
            return false
        }
        else
            return true
    }

    const handleSubmit = () => {
        if(validateForm()){
            dispatch('createsubmit', {quantized_image: quantized, outlined_image: outlined, swatch_image: swatch, name: pbn_name, tags: ParseTags(pbn_tags)})
        }
    }

    const toggleUseNumbers = () => {
        const checkmark = document.getElementById("use-numbers-checkmark")

        use_numbers = !use_numbers
        if(use_numbers)
            checkmark.style.backgroundColor="#4a40d4"
        else
        checkmark.style.backgroundColor="red"
    }

    const toggleAdvancedOptions = () => {
        const checkmark = document.getElementById("advanced-options-checkmark")

        advanced_options = !advanced_options
        if(advanced_options)
            checkmark.style.backgroundColor="#4a40d4"
        else{
            bg_color = "#ffffff"
            smoothing = 2
            cleanup_iterations = 5
            cleanup_intensity = 10
            minimum_labeled_region = 40
            checkmark.style.backgroundColor="red"
        }
    }
</script>

<div class="container">
    <div class="card">
        <h2 class="first-h2">generate your images</h2>
        {#if !advanced_options}
            <div class="form-item">
                <div class="label">complexity</div>
                <RangeSlider float step={1} min={1} max={10} bind:values={complexity} />
            </div>
        {/if}
        <div class="form-item">
            <div class="label">line weight</div>
            <RangeSlider float step={1} min={1} max={10} bind:values={line_thickness} />
        </div>
        <div class="form-item">
            <label style="background-color:{line_color};" class="color-container">
                <input type="color" bind:value={line_color} />
                line color
            </label>
        </div>
        <!--<div class="form-item">
            <div class="label">line color</div>
            <input type="color" bind:value={line_color} />
        </div>-->
        <div class="form-item">
            <div class="checkmark-container" id="use-numbers-checkmark" on:click={toggleUseNumbers}>
                <span class="checkmark"></span>
                {use_numbers ? '✔' : '✘'} show labels
            </div>
        </div>
        {#if use_numbers}
            <div class="form-item">
                <div class="label">label size</div>
                <RangeSlider float step={1} min={5} max={30} bind:values={number_size} />
            </div>
            <div class="form-item">
                <label style="background-color:{number_color};" class="color-container">
                    <input type="color" bind:value={number_color} />
                    label color
                </label>
            </div>
        {/if}
        <div class="form-item">
            <div style="background-color: red" class="checkmark-container" id="advanced-options-checkmark" on:click={toggleAdvancedOptions}>
                <span class="checkmark"></span>
                {advanced_options ? '✔' : '✘'} advanced options
            </div>
        </div>
        {#if advanced_options}
            <div class="form-item">
                <label style="background-color:{bg_color}; color:black;" class="color-container">
                    <input type="color" bind:value={bg_color} />
                    background color
                </label>
            </div>
            <div class="form-item">
                <div class="label">complexity (1-100)</div>
                <input type="number" step="1" bind:value={smoothing} />
            </div>
            <div class="form-item">
                <div class="label">minimum size for labeled regions (pixels)</div>
                <input type="number" step="1" bind:value={minimum_labeled_region} />
            </div>
            <div class="form-item">
                <div class="label">cleanup iterations (0-30)</div>
                <input type="number" step="1" bind:value={cleanup_iterations} />
            </div>
            <div class="form-item">
                <div class="label">cleanup intensity (1-100)</div>
                <input type="number" step="1" bind:value={cleanup_intensity} />
            </div>
        {/if}
        <div class="form-item"> 
            <button on:click={handleGenerate}>generate</button>
        </div>
        {#if generation_complete}
            <h2>previews</h2>
            <div class="form-item">
                <a target="_blank" rel="noopener noreferrer" href={quantized} download="my_fully_colored_creation.png">
                    <img id="completed-img" alt="completed" src={quantized}/>
                </a>
                <a target="_blank" rel="noopener noreferrer" href={outlined} download="my_outlined_creation.png">
                    <img id="outline-img" alt="outline" src={outlined}/>
                </a>
                <a target="_blank" rel="noopener noreferrer" href={swatch} download="my_creations_swatches.png">
                    <img id="swatch-img" alt="swatch" src={swatch}/>
                </a>
            </div>
        {/if}
        {#if $logged_in && generation_complete}
            <h2>upload</h2>
            <form on:submit|preventDefault={handleSubmit}>
                <div class="form-item">
                    <div class="label">title</div>
                    <input type="text" bind:value={pbn_name} />
                </div>
                <div class="form-item">
                    <div class="label">tags</div>
                    <textarea rows="1" type="text" bind:value={pbn_tags} />
                </div>
                <div class="form-item">
                    <div class="label">name</div>
                    <input disabled="true" type="text" value={$user.username} />
                </div>
                <div class="form-item">
                    <button class="button-submit" disabled={!generation_complete || !/\S/.test(pbn_name) || published} type="submit">{published ? "uploaded!" : "upload to browser"}</button>
                </div>
            </form>
      {/if}
    </div>
</div>
<canvas id="testcanvas"></canvas>

<style>
    h2{
        text-align: center;
        margin-bottom: 0.5em;
        margin-top: 1em;
    }
    .first-h2{
        text-align: center;
        margin-bottom: 0.5em;
        margin-top: 0;
    }
    .card{
        min-width: 15em;
        color: white;
        box-sizing: border-box;
        border-radius: 0.5em;
        box-shadow: 0px 0px 15px 5px #000000;
        margin: 2em;
        background-color: #1687a7;
        display: flex;
        flex-direction: column;
        padding: 1em;
    }
    .label{
        margin-top: 0.5em;
        text-align: center;
    }
    .form-item{
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: stretch;
        margin: 0.5em
    }
    button {
        width: 100%;
        height: min-content;
        background-color:#276678;
        border-radius:42px;
        display:inline-block;
        cursor:pointer;
        color:#ffffff;
        font-family:Arial;
        font-size:15px;
        font-weight:bold;
        padding:10px 39px;
        text-decoration:none;
        margin-top: 1em;
    }
    button:hover {
        background-color:#4a40d4;
    }
    button:active {
        position:relative;
        top:1px;
        outline: none;
    }
    button:disabled,
    button[disabled]{
        background-color: #bbb;
        color: #999;
    }
    .button-submit{
        margin-top: 2em;
    }
    img{
        border-radius: 0.5em;
        width: 100%;
        /*max-width: calc(100vw - 2em);*/
        height: auto;
        margin-top: 0.5em;
    }
    input[type='text'] {
		width: 100%;
		margin: 0.5em 0 0 0;
	}
	input[type='text']:focus {
		background-color: #4a40d4;
		color: white;
		outline: none;
	}
    input[type='color'] {
        display: none;
	}
    .color-container{
        width: 100%;
		margin: 0.5em 0 0 0;
        border-radius:42px;
        color: white;
        cursor: pointer;
        height: 36.67px;
        line-height: 36.67px;
        vertical-align: middle;
        text-align: center;
    }
    textarea{
        resize: vertical;
        width: 100%;
		margin: 0.5em 0 0 0;
    }
    textarea:focus{
        background-color: #4a40d4;
		color: white;
		outline: none;
    }

    .checkmark-container{
        display: flex;
        flex-direction: row;
        justify-content: center;
        background-color: #4a40d4;
        color: white;
        cursor: pointer;
        width: 100%;
        height: 36.67px;
        line-height: 36.67px;
        vertical-align: middle;
        border-radius:42px;
    }

</style>