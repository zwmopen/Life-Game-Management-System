// 共享的物种数据定义，包含植物和动物的基础类型及其变体

export interface Species {
  id: string;
  name: string;
  icon: string;
}

export interface SpeciesData {
  plants: Species[];
  animals: Species[];
}

// 基础物种类型定义
const baseSpecies = {
  plants: [
    { id: 'pine', name: '松树', icon: '🌲' },
    { id: 'oak', name: '橡树', icon: '🌳' },
    { id: 'cherry', name: '樱花', icon: '🌸' },
    { id: 'willow', name: '垂柳', icon: '🌿' },
    { id: 'bamboo', name: '竹子', icon: '🎋' },
    { id: 'palm', name: '椰树', icon: '🌴' },
    { id: 'cactus', name: '仙人掌', icon: '🌵' },
    { id: 'mushroom', name: '巨菇', icon: '🍄' },
    { id: 'sunflower', name: '向日葵', icon: '🌻' },
    { id: 'birch', name: '白桦', icon: '🪵' }
  ],
  animals: [
    { id: 'rabbit', name: '白兔', icon: '🐰' },
    { id: 'fox', name: '赤狐', icon: '🦊' },
    { id: 'panda', name: '熊猫', icon: '🐼' },
    { id: 'pig', name: '小猪', icon: '🐷' },
    { id: 'chick', name: '小鸡', icon: '🐤' },
    { id: 'penguin', name: '企鹅', icon: '🐧' },
    { id: 'frog', name: '青蛙', icon: '🐸' },
    { id: 'sheep', name: '绵羊', icon: '🐑' },
    { id: 'bear', name: '棕熊', icon: '🐻' },
    { id: 'bee', name: '普通工蜂', icon: '🐝' }
  ]
};

// 生成带有序号的物种数据（用于UI显示）
export const generateSpeciesWithNumbers = (): SpeciesData => {
  return {
    plants: baseSpecies.plants.flatMap(plant => [
      { ...plant, id: plant.id, name: `${plant.name}1` },
      { ...plant, id: `${plant.id}2`, name: `${plant.name}2` }
    ]),
    animals: baseSpecies.animals.flatMap(animal => {
      if (animal.id === 'bee') {
        // 对蜜蜂进行特殊处理，生成普通工蜂和熊蜂
        return [
          { ...animal, id: animal.id, name: '普通工蜂' },
          { ...animal, id: `${animal.id}2`, name: '熊蜂' }
        ];
      } else if (animal.id === 'bear') {
        // 对熊进行特殊处理，生成棕熊和北极熊
        return [
          { ...animal, id: animal.id, name: '棕熊' },
          { ...animal, id: `${animal.id}2`, name: '北极熊' }
        ];
      }
      return [
        { ...animal, id: animal.id, name: `${animal.name}1` },
        { ...animal, id: `${animal.id}2`, name: `${animal.name}2` }
      ];
    })
  };
};

// 生成基础物种数据（用于3D模型创建）
export const generateBaseSpecies = (): SpeciesData => {
  return {
    plants: baseSpecies.plants.flatMap(plant => [
      { ...plant, id: plant.id },
      { ...plant, id: `${plant.id}2` }
    ]),
    animals: baseSpecies.animals.flatMap(animal => [
      { ...animal, id: animal.id },
      { ...animal, id: `${animal.id}2` }
    ])
  };
};

// 默认导出用于UI显示的物种数据（带有序号）
export const SPECIES: SpeciesData = generateSpeciesWithNumbers();

// 导出用于3D模型创建的物种数据（基础名称）
export const BASE_SPECIES: SpeciesData = generateBaseSpecies();
