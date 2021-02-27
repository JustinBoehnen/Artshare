<script>
    import Image from "svelte-image";
    import { createEventDispatcher } from 'svelte';
    import ShortenNumber from "short-number"
    import IconLike from "../../static/images/icon_like.svg"
    import IconDislike from "../../static/images/icon_dislike.svg"

    let defaultImage = "https://cdn.shortpixel.ai/client/to_avif,q_glossy,ret_img,w_400,h_264/https://cannabisbydesignphysicians.com/wp-content/themes/apexclinic/images/no-image/No-Image-Found-400x264.png"
    export let pbn = {}

	function ParseTags() {
		if (filterTags != '') {
			return filterTags
				.split(' ')
				.join('')
				.split(',')
				.map((t) => t.toLowerCase())
		}

		return []
	}

    const fetchImage = (async () => {
        console.log(`fetching image @ ${pbn.images.thumbnail}`)
		const response = await fetch(pbn.images.thumbnail)

        const res = await response

        if(res.status === 404){
            return defaultImage
        }
        else{
            return pbn.images.thumbnail
        }
	})

    let thumbnail = fetchImage();

    const dispatch = createEventDispatcher();

    let cardClicked = () => {
        console.log(`clicked on card with pbn id: ${pbn._id}`)
        dispatch('toggle', {pbn: pbn})
    }
</script>

<div class="card" on:click={cardClicked}>
    <div class="thumbnail">
        {#await thumbnail}
            Loading Image...
        {:then res}
            <Image height="100px" src={res} />
        {/await}
    </div>
    <div class="details">
        <div class="name-details">
            <h4>{pbn.name}</h4>
        </div>
        <div class="sub-details">
            <div class="owner">
                <h6>By: {pbn["owner-name"]}</h6>
            </div>
            <div class="image-text-combo">
                <img class="image" src={IconLike} alt="likes"/>
                <h6>{ShortenNumber(pbn.likes)}</h6>
            </div>
            <div class="image-text-combo">
                <img class="image" src={IconDislike} alt="dislikes"/>
                <h6>{ShortenNumber(pbn.dislikes)}</h6>
            </div>
        </div>
    </div>
</div>

<style>
    h4 {
        margin: 0;
    }
    h6 {
        margin: 0;
    }
	.card {
		display: flex;
		background-color: #1687a7;
		flex-direction: column;
        justify-content: space-between;
        border-radius: 1em;
        width: 10em;
        height: 10em;
        padding: 1em;
        margin: 1em;
        color: white;
	}
    .card:hover{
        cursor: pointer;
    }
    .thumbnail{
        width: 100%;
        height: 100px;
    }
    .details{
        display: flex;
        flex-direction: column;
        bottom: 0;
        width: 100%;
    }
    .name-details{
        margin-bottom: 0.5em;
        width: 100%;
        overflow: hidden;
        display: -webkit-box;
        line-height: 1;     /* fallback */
        max-height: 1;      /* fallback */
        -webkit-line-clamp: 1; /* number of lines to show */
        -webkit-box-orient: vertical;
    }
    .sub-details{
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        width: 100%;
    }
    .image-text-combo{
        display: flex;
        flex-grow: 1;
        flex-direction: row;
        justify-content: space-evenly;
        align-items: center;
    }
    .owner{
        flex-grow: 2;
        overflow: hidden;
        display: -webkit-box;
        line-height: 1;     /* fallback */
        max-height: 1;      /* fallback */
        -webkit-line-clamp: 1; /* number of lines to show */
        -webkit-box-orient: vertical;
    }
    .image{
        height: 12px;
        width: 12px;
    }
</style>
