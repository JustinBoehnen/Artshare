<!--Justin Boehnen 2021-->
<script>
    import { onMount } from 'svelte';
    import { cropImage } from '../../scripts/colorQuantization'
    import { createEventDispatcher } from 'svelte';
    import ColorThief from 'colorthief'

    
    export let src_img
    export let palette = []

    const colorThief = new ColorThief()
    const dispatch = createEventDispatcher()
    var canvas
    var ctx
    var dynamic_count = 5

    onMount(()=> {
        canvas = document.getElementById('color-picker')
        ctx = canvas.getContext('2d')
        canvas.width = src_img.width
        canvas.height = src_img.height
        ctx.drawImage(src_img, 0, 0)

        canvas.addEventListener('mousedown', function(e) {
            addColor(e)
        })

        canvas.addEventListener('mousemove', function(e) {
            updateColorPreview(e)
        })
    })

    const handleSubmit = () => {
        dispatch('colorsubmit', {palette})
        
    }

    const removeColor = (index) => {
        palette.splice(index, 1)
        palette = palette
    }

    const getColorAtPos = (x, y) => {
        var data = ctx.getImageData(x, y, 1, 1).data
        return [data[0], data[1], data[2]]
    }

    const addColor = (e) => {
        const xScale = canvas.width/canvas.clientWidth
        const yScale = canvas.height/canvas.clientHeight
        const x = e.offsetX*xScale
        const y = e.offsetY*yScale
        const color = getColorAtPos(x,y)
        if(palette.length < 100){
            palette.push(getColorAtPos(x,y))
            palette = palette
        }
        else{
            alert("Maximum number of colors selected")
        }
    }

    const updateColorPreview = (e) => {
        const preview = document.getElementById("color-preview")
        const xScale = canvas.width/canvas.clientWidth
        const yScale = canvas.height/canvas.clientHeight
        const x = e.offsetX*xScale
        const y = e.offsetY*yScale
        var color = getColorAtPos(x,y)
        preview.style.backgroundColor = `rgb(${color[0]},${color[1]},${color[2]})`
    }

    const addDominantColors = () => {
        if(dynamic_count > 100)
            dynamic_count = 100
        else if (dynamic_count < 2)
            dynamic_count = 2

		palette = colorThief.getPalette(src_img, dynamic_count)
    }

</script>
    
    <div class="container">
        <div class="card">
            <h2>pick your colors</h2>
            {#if palette.length > 0}
                <div class="form-item">
                    <div class="color-header">
                        <div class="label">palette</div>
                        <div class="label">{palette.length}/100</div>
                    </div>
                    <div class="colors">
                        {#each palette as color, i}
                            <div on:click={() => {removeColor(i)}} class="color-block" style="background-color:rgb({color[0]}, {color[1]}, {color[2]})"/>
                        {/each}
                    </div>
                </div>
            {/if}
            <div class="form-item">
                <div class="label">color picker</div>
                <div id="color-preview" class="color-preview"/>
                <canvas class="color-picker-image" id="color-picker"/>
            </div>
            <div class="form-item">
                <div class="dynamic-color-section">
                    choose
                    <input type="text" bind:value={dynamic_count} />
                    colors for me
                    <button class="dynamic-go-button" on:click={addDominantColors}>go!</button>
                </div>
            </div>
            <div class="form-item">
                <button disabled={palette.length < 2} on:click={handleSubmit}>next step</button>
            </div>
        </div>
    </div>
    
    <style>
        h2{
            text-align: center;
            margin-bottom: 0.5em;
            margin-top: 0;
        }
        .dynamic-color-section{
            display: flex;
            flex-direction: row;
            justify-content: center;
            align-items: center;
        }
        .color-preview{
            margin-top: 0.5em;
            border-radius: 0.5em;
            height: 32px;
            background-color: white;
        }
        .color-picker-image{
            width: 100%;
            margin-top: 0.5em;
            cursor: crosshair;
            border-radius: 0.5em;
        }
        .form-item{
            display: flex;
            flex-direction: column;
            align-items: stretch;
            margin: 0.5em
        }
        .card{
            min-width: 15em;
            box-sizing: border-box;
            border-radius: 0.5em;
            box-shadow: 0px 0px 15px 5px #000000;
            margin: 2em;
            background-color: #1687a7;
            color: white;
            display: flex;
            flex-direction: column;
            align-items: stretch;
            padding: 1em;
        }
        .color-header{
            display: flex;
            flex-direction: row;
            justify-content: space-between;
        }
        .colors{
            margin-top: 0.5em;
            background-color: white;
            border-radius: 0.5em;
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
            padding: 0.5em 0.25em 0.25em 0.5em;
        }
        .color-block{
            cursor: pointer;
            border-radius: 5px;
            height:20px;
            width:20px;
            margin-right: 0.25em;
            margin-bottom: 0.25em;
        }
        .label{
            margin-top: 0.5em;
            text-align: center;
        }
        button {
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
        .dynamic-go-button{
            padding: 10px 20px;
            margin: 0;
            margin-left: 0.5em;
        }
        input[type='text'] {
            text-align: center;
            height: min-content;
            width: 3em;
            margin: 0 0.5em 0 0.5em;
        }
        input[type='text']:focus {
            background-color: #4a40d4;
            color: white;
            outline: none;
        }
    </style>