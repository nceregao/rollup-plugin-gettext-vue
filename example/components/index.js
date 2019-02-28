const local = {};
const components = require.context('./', true, /\w+\.vue$/);
components.keys().forEach(fileName => {
    // Получение конфигурации компонента
    const componentConfig = components(fileName);

    // Получение имени компонента в PascalCase
    const componentName = 'c' + fileName.replace(/^\.\/(g-)?(.*)\.\w+$/, '$2');

    local[componentName] = componentConfig;
});

export default local;
