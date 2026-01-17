// 全局类型声明文件，用于解决模块导入问题

declare module '*.tsx' {
  const component: React.ComponentType<any>;
  export default component;
}

declare module '*.ts' {
  const component: React.ComponentType<any>;
  export default component;
}

// 特定模块声明
declare module './components/LifeGame/BattleTab' {
  const component: React.ComponentType<any>;
  export default component;
}

declare module './components/LifeGame/ShopTab' {
  const component: React.ComponentType<any>;
  export default component;
}

declare module './components/LifeGame/ArmoryTab' {
  const component: React.ComponentType<any>;
  export default component;
}