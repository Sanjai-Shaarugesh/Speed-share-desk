module.exports = {
  makers: [
    {
      name: '@electron-forge/maker-rpm',
      config: {
        options: {
          icon: 'build/icon.png'
        }
      }
    }
  ]
};
