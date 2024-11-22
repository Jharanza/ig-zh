<template>
  <section class="instagram-section">
    <div class="title-container">
      <p>Follow us</p>
      <h2>@hotelzamora</h2>
    </div>
    <div class="reels-container">
      <div
        v-for="(reel, index) in reels"
        :key="index"
        class="reel-video"
        @click="openReel(reel.post_url)"
      >
        <video 
        :src="reel.video_url" 
        alt="Reel video" 
        autoplay
        muted
        loop
        playsinline
        />
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { ref, onMounted } from 'vue';

export default {
  setup() {
    const reels = ref<{
      video_url: string;
      thumbnail_url: string;
      post_url: string;
    }[]>([]);

    const fetchReels = async () => {
      try {
        const response = await fetch('https://mi-backend-en-railway.up.railway.app/api/reels');        if (response.ok) {
          const data = await response.json();
          reels.value = data;
        } else {
          console.error('Error fetching reels');
        }
      } catch (error) {
        console.error('Network error:', error);
      }
    };

    const openReel = (url: string) => {
      window.open(url, '_blank')
    };

    onMounted(() => {
      fetchReels();
    });

    return {
      reels,
      openReel,
    };
  },
};
</script>


<style scoped>
/* Contenedor de reels alineados horizontalmente */
.instagram-section {
  width: 100%;
  max-width: 1024px;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  align-items: center;
  text-size-adjust: 100%;
  padding: 50px 20px;
}

.title-container {
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 0;
}

.title-container > p {
  margin: 0 5px 7px 0;
  width: 90%;
  display: flex;
  align-items: center;
}

.title-container > h2 {
  display: flex;
  align-items: end;
}

.reels-container {
  width: 100%;
  max-width: 1024px;
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
}

.reel-video {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Videos de reels */
.reel-video video {
  width: 100%;
  height: 100%;
  object-fit:fill;
  aspect-ratio: 1/1;
  height: auto;
  cursor: pointer;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.5s ease;
}

.reel-video video:hover {
  transform: scale(1.05);
}
</style>
