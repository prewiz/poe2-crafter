const axios = require('axios');
const fs = require('fs/promises');
const path = require('path');

const POE2_DATA_BASE_URL = 'https://repoe-fork.github.io/poe2'; 

async function fetchDataAndSave(relativePath, fileName, processFunction) {
  try {
    const fullUrl = `${POE2_DATA_BASE_URL}/${relativePath}`; 
    console.log(`Fetching data from ${fullUrl}...`);
    const response = await axios.get(fullUrl);
    const rawData = response.data; 

    const processedData = processFunction(rawData);

    const filePath = path.join(__dirname, '..', `${fileName}.json`); 
    await fs.writeFile(filePath, JSON.stringify(processedData, null, 2)); 
    console.log(`${fileName}.json updated successfully at ${filePath}`);
  } catch (error) {
    console.error(`Error fetching or processing ${fileName} from ${POE2_DATA_BASE_URL}/${relativePath}:`, error.message);
    throw error;
  }
}

function processItems(rawData) {
  if (typeof rawData !== 'object' || rawData === null) {
      console.warn("Raw items data is not an object:", rawData);
      return [];
  }
  return Object.values(rawData).map(item => ({
    id: item.id,
    name: item.name,
    itemClass: item.item_class,
    baseItemLevel: item.drop_level, 
    maxItemLevel: item.max_item_level || 100, 
    implicitMods: item.implicits || [], 
    modTags: item.tags || [],
    itemStats: { 
        physicalDamageMin: item.properties?.physical_damage?.min,
        physicalDamageMax: item.properties?.physical_damage?.max,
        attackSpeed: item.properties?.attack_speed,
        criticalStrikeChance: item.properties?.critical_strike_chance,
    }
  }));
}

function processMods(rawData) {
  if (typeof rawData !== 'object' || rawData === null) {
      console.warn("Raw mods data is not an object:", rawData);
      return [];
  }
  return Object.values(rawData).map(mod => ({
    id: mod.id,
    name: mod.name, 
    type: mod.type, 
    modGroup: mod.mod_group, 
    generationType: mod.generation_type, 
    itemLevel: mod.spawn_level, 
    spawnWeights: mod.spawn_weights || [], 
    stats: mod.stats || [] 
  }));
}

async function main() {
  console.log("Starting data update process using repoe-fork.github.io/poe2 data...");
  try {
    await fetchDataAndSave('base_items.json', 'items', processItems); 
    await fetchDataAndSave('mods.json', 'mods', processMods);
    console.log("Data update process completed successfully.");
  } catch (error) {
    console.error("Data update process failed:", error);
    process.exit(1); 
  }
}

main();