const contents = [
  {
    type: "storyTitle",
    title: (
      <div>
        The Story of
        <br />
        Stringed Instrument Bows
      </div>
    )
  },
  {
    type: "text",
    title: "Vienna Philharmonic",
    text: (
      <>
        The Vienna Philharmonic (VPO; German: Wiener Philharmoniker) is an
        orchestra that was founded in 1842 and is considered to be one of the
        finest in the world. <br />
        The Vienna Philharmonic is based at the Musikverein in Vienna, Austria.
        Its members are selected from the orchestra of the Vienna State Opera.
        Selection involves a lengthy process, with each musician demonstrating
        their capability for a minimum of three years' performance for the opera
        and ballet. After this probationary period, the musician may request an
        application for a position in the orchestra from the Vienna
        Philharmonic's board.
      </>
    ),
    image: {
      url: "https://upload.wikimedia.org/wikipedia/commons/5/59/Musikverein_Goldener_Saal.jpg",
      caption:
        'Goldener Saal [Golden Hall] of the "Musikverein" in Vienna. Note that its precise name is Großer Konzerthaussaal [Big Hall], "golden" just being a later added common attribute (guess why ;).',
      width: "100%",
      copyright: (
        <>
          <a href="https://commons.wikimedia.org/wiki/File:Musikverein_Goldener_Saal.jpg">
            Clemens PFEIFFER, A-1190 Wien
          </a>
          ,{" "}
          <a href="https://creativecommons.org/licenses/by-sa/3.0">
            CC BY-SA 3.0
          </a>
          , via Wikimedia Commons
        </>
      )
    },
    flyTo: {
      // bearing: 90,
      // pitch: 40
      center: [16.3727683154214, 48.20050021403356],
      zoom: 15,
      speed: 0.8
    },
    width: "100%"
  },
  {
    type: "text",
    title: "The Orchestra",
    text: (
      <>
        Lights go out and the concert hall becomes quiet, violinists start to
        stroke the strings of their instruments with horse hair strung wooden
        bows so that they vibrate in harmony. The oscillations pass on to the
        resonator body of the violins and the produced sound waves progress over
        the air into the ears and bodies of the audience.
      </>
    ),
    image: {
      url: "https://upload.wikimedia.org/wikipedia/commons/f/ff/Vienna_Philharmonic_Orchestra%2C_Carnegie_Hall%2C_conducted_by_Michael_Tilson_Thomas_%2847311081031%29.jpg",
      caption: (
        <>
          Vienna Philharmonic Orchestra – Mahler's "Ninth Symphony" – conducted
          by Michael Tilson Thomas
          <br />
          March 6, 2019 Carnegie Hall
        </>
      ),
      width: "50%",
      copyright: (
        <>
          <a href="https://commons.wikimedia.org/wiki/File:Vienna_Philharmonic_Orchestra,_Carnegie_Hall,_conducted_by_Michael_Tilson_Thomas_(47311081031).jpg">
            Steven Pisano
          </a>
          , <a href="https://creativecommons.org/licenses/by/2.0">CC BY 2.0</a>,
          via Wikimedia Commons
        </>
      )
    },
    visualization: {},
    audio: {
      url: "https://upload.wikimedia.org/wikipedia/commons/3/30/Mahler_-_Symphony_N%C2%B0_9_-_I_%28B._Walter%2C_1938%29.ogg#t=00:00:24",
      copyright: (
        <>
          <a href="https://commons.wikimedia.org/wiki/File:Mahler_-_Symphony_N%C2%B0_9_-_I_(B._Walter,_1938).ogg">
            Gustav Malher, interprété par Bruno Walter et le Vienna Philhamornic
            Orchestra.
          </a>
          , Public domain, via Wikimedia Commons
        </>
      ),
      caption: (
        <>
          Symphony N° 9 - I. Andante comodo.
          <br />
          Enregistrement public le 16 janvier 1938 à la Musikvereinsaal de
          Vienne.
        </>
      )
    },
    effect: { type: "black", duration: 0.5 },
    flyTo: {
      // bearing: 90,
      // pitch: 40
      center: [-73.97992337336923, 40.76512993427731],
      zoom: 19,
      speed: 0.4
    },
    width: "100%"
  },
  {
    type: "text",
    title: "The Orchestra & It's Instruments",
    text: "",
    image: {
      url: "./orchestraScreenshot.png",
      caption: "",
      width: "80%"
    }
  },
  {
    type: "text",
    title: "Stringed Instrument Bows",
    text: "In music, a bow is a tensioned stick which has hair (usually horse-tail hair) coated in rosin (to facilitate friction) affixed to it. It is moved across some part (generally some type of strings) of a musical instrument to cause vibration, which the instrument emits as sound. The vast majority of bows are used with string instruments, such as the violin, viola, cello, and bass, although some bows are used with musical saws and other bowed idiophones.",
    image: {
      url: "https://upload.wikimedia.org/wikipedia/commons/7/78/Violin_Bow_MET_256002.jpg",
      caption: "Violin Bow, French (MET, 1991.28.4)",
      copyright: (
        <>
          <a href="https://commons.wikimedia.org/wiki/File:Violin_Bow_MET_256002.jpg">
            Metropolitan Museum of Art
          </a>
          , CC0, via Wikimedia Commons
        </>
      ),
      width: "100%"
    }
  },
  {
    type: "text",
    title: "Brazil",
    text: "Brazil officially the Federative Republic of Brazil (Portuguese: República Federativa do Brasil), is the largest country in South America and in Latin America. At 8.5 million square kilometers (3,300,000 sq mi) and with over 217 million people, Brazil is the world's fifth-largest country by area and the seventh most populous. Its capital is Brasília, and its most populous city is São Paulo. The federation is composed of the union of the 26 states and the Federal District. It is the only country in the Americas to have Portuguese as an official language. It is one of the most multicultural and ethnically diverse nations, due to over a century of mass immigration from around the world, and the most populous Roman Catholic-majority country.",
    image: {
      url: "./P1020999.JPG",
      width: "50%"
    },
    flyTo: {
      // bearing: 90,
      // pitch: 40
      center: [-47.882778, -15.793889],
      zoom: 3,
      speed: 0.8
    }
  },
  {
    type: "text",
    title: "Brazil's Ecoregions",
    text: "Brazil's large territory comprises different ecosystems, such as the Amazon rainforest, recognized as having the greatest biological diversity in the world, with the Atlantic Forest and the Cerrado, sustaining the greatest biodiversity. In the south, the Araucaria moist forests grow under temperate conditions. The rich wildlife of Brazil reflects the variety of natural habitats. Scientists estimate that the total number of plant and animal species in Brazil could approach four million, mostly invertebrates. Larger mammals include carnivores pumas, jaguars, ocelots, rare bush dogs, and foxes, and herbivores peccaries, tapirs, anteaters, sloths, opossums, and armadillos. Deer are plentiful in the south, and many species of New World monkeys are found in the northern rain forests.",
    image: {
      url: "https://upload.wikimedia.org/wikipedia/commons/1/18/Amazon_CIAT_%285%29.jpg",
      copyright: (
        <>
          <a href="https://commons.wikimedia.org/wiki/File:Amazon_CIAT_(5).jpg">
            Neil Palmer/CIAT
          </a>
          ,{" "}
          <a href="https://creativecommons.org/licenses/by-sa/2.0">
            CC BY-SA 2.0
          </a>
          , via Wikimedia Commons
        </>
      ),
      caption:
        "Aerial view of the Amazon Rainforest, near Manaus, the capital of the Brazilian state of Amazonas.",
      width: "60%"
    },
    flyTo: {
      // bearing: 90,
      // pitch: 40
      center: [-58.84912385114777, -2.7138735491136114],
      zoom: 8,
      speed: 0.8
    }
  },
  {
    type: "fullSizeQuote",
    quote: {
      text: (
        <div>
          <div
            style={{
              marginLeft: "-100%",
              whiteSpace: "nowrap"
            }}
          >
            "Le violon
          </div>
          <div
            style={{
              marginRight: "-100%",
              whiteSpace: "nowrap"
            }}
          >
            c'est l'archet"
          </div>
        </div>
      ),
      author: "Giovanni Battista Viotti (violanist)",
      translation: "The violin, that's the bow."
    },
    image: {
      url: "https://upload.wikimedia.org/wikipedia/commons/a/a7/Giovanni_Battista_Viotti_by_Ducarme.jpg",
      width: "100%"
    }
  },
  {
    type: "text",
    title: "Mata Atlântica",
    text: "The emblematic and culturally important brazilwood tree tells a bundle of stories - on one hand a story of social and cultural exploitation and on the other of music and culture. The beauty of its flowers with their sweet smell attracts bees and fascinates people. Brazilwood is an endemic species only found in the Mata Atlântica biome located along the east coast of Brazil. This coastal rainforest counts with an extraordinary species richness, many of these species being endemic while at the same time ⅔ of Brazilians population is living in that same region. As a result of deforestation, land use change and urbanization the Mata Atlântica is decimated to only 7% of its original extent, a highly threatened ecoregion and one of the 36 global biodiversity hotspots."
  },
  {
    type: "text",
    title: "Mata Atlântica",
    text: "The emblematic and culturally important brazilwood tree tells a bundle of stories - on one hand a story of social and cultural exploitation and on the other of music and culture. The beauty of its flowers with their sweet smell attracts bees and fascinates people. Brazilwood is an endemic species only found in the Mata Atlântica biome located along the east coast of Brazil. This coastal rainforest counts with an extraordinary species richness, many of these species being endemic while at the same time ⅔ of Brazilians population is living in that same region. As a result of deforestation, land use change and urbanization the Mata Atlântica is decimated to only 7% of its original extent, a highly threatened ecoregion and one of the 36 global biodiversity hotspots.",
    image: {
      url: "https://upload.wikimedia.org/wikipedia/commons/8/85/Ba%C3%ADa_de_Antonina_vista_da_Serra_do_Mar2.JPG",
      caption: "Antonina Bay as viewed from the Serra do Mar Paranaense.",
      width: "60%",
      copyright: (
        <>
          <a href="https://commons.wikimedia.org/wiki/File:Ba%C3%ADa_de_Antonina_vista_da_Serra_do_Mar2.JPG">
            Deyvid Setti e Eloy Olindo Setti
          </a>
          ,{" "}
          <a href="https://creativecommons.org/licenses/by-sa/3.0">
            CC BY-SA 3.0
          </a>
          , via Wikimedia Commons
        </>
      )
    },
    flyTo: {
      // bearing: 90,
      // pitch: 40
      center: [-0.08533793, 51.50438536],
      zoom: 13,
      speed: 0.6
    }
  },
  {
    type: "text",
    title: "Mata Atlântica",
    text: "The emblematic and culturally important brazilwood tree tells a bundle of stories - on one hand a story of social and cultural exploitation and on the other of music and culture. The beauty of its flowers with their sweet smell attracts bees and fascinates people. Brazilwood is an endemic species only found in the Mata Atlântica biome located along the east coast of Brazil. This coastal rainforest counts with an extraordinary species richness, many of these species being endemic while at the same time ⅔ of Brazilians population is living in that same region. As a result of deforestation, land use change and urbanization the Mata Atlântica is decimated to only 7% of its original extent, a highly threatened ecoregion and one of the 36 global biodiversity hotspots."
  },
  {
    type: "text",
    title: "Mata Atlântica",
    text: "The emblematic and culturally important brazilwood tree tells a bundle of stories - on one hand a story of social and cultural exploitation and on the other of music and culture. The beauty of its flowers with their sweet smell attracts bees and fascinates people. Brazilwood is an endemic species only found in the Mata Atlântica biome located along the east coast of Brazil. This coastal rainforest counts with an extraordinary species richness, many of these species being endemic while at the same time ⅔ of Brazilians population is living in that same region. As a result of deforestation, land use change and urbanization the Mata Atlântica is decimated to only 7% of its original extent, a highly threatened ecoregion and one of the 36 global biodiversity hotspots.",
    width: "50%"
  },
  {
    type: "text",
    title: "Mata Atlântica",
    text: "The emblematic and culturally important brazilwood tree tells a bundle of stories - on one hand a story of social and cultural exploitation and on the other of music and culture. The beauty of its flowers with their sweet smell attracts bees and fascinates people. Brazilwood is an endemic species only found in the Mata Atlântica biome located along the east coast of Brazil. This coastal rainforest counts with an extraordinary species richness, many of these species being endemic while at the same time ⅔ of Brazilians population is living in that same region. As a result of deforestation, land use change and urbanization the Mata Atlântica is decimated to only 7% of its original extent, a highly threatened ecoregion and one of the 36 global biodiversity hotspots."
  },
  { type: "end", title: "Le Fin" },
  {
    type: "text",
    title: "Authors",
    height: "25vh",
    text: (
      <>
        Silke Lichtenberg
        <br />
        Jakob Kusnick
      </>
    )
  },
  {
    type: "text",
    title: "Images",
    height: "25vh",
    text: (
      <>
        Silke Lichtenberg
        <br />
        Jakob Kusnick
      </>
    )
  },
  {
    type: "text",
    title: "Music",
    height: "25vh",
    text: (
      <>
        Silke Lichtenberg
        <br />
        Jakob Kusnick
      </>
    )
  },
  {
    type: "text",
    title: "Thanks",
    height: "25vh",
    text: (
      <>
        Silke Lichtenberg
        <br />
        Jakob Kusnick
      </>
    )
  }
];

export default contents;
