const basePath = process.cwd();
const fs = require("fs");
const layersDir = `${basePath}/layers`;

const { layerConfigurations } = require(`${basePath}/src/config.js`);

const { getElements } = require("../src/main.js");

// read json data
let rawdata = fs.readFileSync(`${basePath}/build/json/_metadata.json`);
let data = JSON.parse(rawdata);
let editionSize = data.length;

let rarityData = [];

// intialize layers to chart
layerConfigurations.forEach((config) => {
  let layers = config.layersOrder;

  layers.forEach((layer) => {
    // get elements for each layer
    let elementsForLayer = [];
    let elements = getElements(`${layersDir}/${layer.name}/`);
    [
      ...elements,
      { name: "RICH", weight: 50 },
      { name: "NONE", weight: 50 },
    ].forEach((element) => {
      // just get name and weight for each element
      const trait = element.name
        .replace("_", " ")
        .split(" ")
        .map((word) => word[0].toUpperCase() + word.slice(1))
        .join(" ");
      let rarityDataElement = {
        trait: trait,
        weight: element.weight.toFixed(0),
        occurrence: 0, // initialize at 0
      };
      elementsForLayer.push(rarityDataElement);
    });
    let layerName =
      layer.options?.["displayName"] != undefined
        ? layer.options?.["displayName"]
        : layer.name;
    // don't include duplicate layers
    if (!rarityData.includes(layer.name)) {
      // add elements for each layer to chart
      rarityData[layerName] = elementsForLayer;
    }
  });
});

// fill up rarity chart with occurrences from metadata
data.forEach((element) => {
  let attributes = element.attributes;
  attributes.forEach((attribute) => {
    let traitType = attribute.trait_type;
    let value = attribute.value;

    let rarityDataTraits = rarityData[traitType];
    rarityDataTraits.forEach((rarityDataTrait) => {
      if (rarityDataTrait.trait == value) {
        // keep track of occurrences
        rarityDataTrait.occurrence++;
      }
    });
  });
});

// convert occurrences to occurence string
// for (var layer in rarityData) {
//   for (var attribute in rarityData[layer]) {
//     // get chance
//     let chance = (
//       (rarityData[layer][attribute].occurrence / editionSize) *
//       100
//     ).toFixed(2);

//     // show two decimal places in percent
//     rarityData[layer][
//       attribute
//     ].occurrence = `${rarityData[layer][attribute].occurrence} in ${editionSize} editions (${chance} %)`;
//   }
// }

// print out rarity data
// for (var layer in rarityData) {
//   console.log(`Trait type: ${layer}`);
//   for (var trait in rarityData[layer]) {
//     console.log(rarityData[layer][trait]);
//   }
//   console.log();
// }

const nftsWithScores = data.map((nft, i) => {
  return {
    tokenId: i,
    rarity: nft.attributes.reduce((rarityScore, attribute) => {
      const { trait_type: layer, value } = attribute;
      const { occurrence } = rarityData[layer].find(
        (trait) => trait.trait == value
      );
      return rarityScore * (occurrence / editionSize);
    }, 1),
  };
});

// console.log(JSON.stringify(nftsWithScores, null, 2));

function range(start, end) {
  return Array(end - start + 1)
    .fill()
    .map((_, idx) => start + idx);
}

const rankings = nftsWithScores
  .sort((a, b) => a.rarity - b.rarity)
  .reduce((rankings, nft, i) => ({ ...rankings, [nft.tokenId]: i }), {});

const myTokenIds = range(671, 795);

myTokenIds.forEach((id) => console.log(`${id}: ${rankings[id]}`));
