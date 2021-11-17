const app = getApp()
var QQMapWX = require('../../utils/qqmap-wx-jssdk');

var qqmapsdk;
Page({
  data: {
    radioValue1:'',
    radioValue2:'',
    radioValue3:'',
    nameValue:'',
    IDValue:'',
    addressValue:'',
    imgs:[],
    locationAddress:'',
  },

  // 单选事件
  radioChange(e) {
    // console.log('radio发生change事件，携带value值为：', e.detail.value)
    this.setData({radioValue1:e.detail.value})
  },
  radioChange2(e) {
    this.setData({radioValue2:e.detail.value})
  },
  radioChange3(e) {
    this.setData({radioValue3:e.detail.value})
  },


  // 生命周期函数--监听页面加载
  onLoad: function(options) {
    // 实例化API核心类，获取位置信息
    qqmapsdk = new QQMapWX({
      key: 'BN7BZ-YHCK3-VIY34-YEJZ2-XUMTV-PWFEL'
    })
  },

  // 生命周期函数--监听页面显示
  onShow() {
    let vm = this
    // vm.getUserLocation()
    let userText = wx.getStorageSync('userText')
    let userText2 = wx.getStorageSync('userText2')
    let userText3 = wx.getStorageSync('userText3')
    if(userText) {
      vm.data.nameValue = userText
      vm.setData(vm.data)
    }
    if(userText2) {
      vm.data.IDValue = userText2
      vm.setData(vm.data)
    }
    if(userText3) {
      vm.data.addressValue = userText3
      vm.setData(vm.data)
    }   // page载入的时候先读取一次，wx.getStorageSync('userText')里面有没有内容,有内容就填充，没有则什么也不做

  },

  getUserLocation: function() {
    let vm = this;
    wx.getSetting({
      success: (res) => {
        if (res.authSetting['scope.userLocation'] != undefined && res.authSetting['scope.userLocation'] != true) {
          wx.showModal({
            title: '请求授权当前位置',
            content: '需要获取您的地理位置，请确认授权',
            success: function(res) {
              if (res.cancel) {
                wx.showToast({
                  title: '拒绝授权',
                  icon: 'none',
                  duration: 1000
                })
              } else if (res.confirm) {
                wx.openSetting({
                  success: function(dataAu) {
                    if (dataAu.authSetting["scope.userLocation"] == true) {
                      wx.showToast({
                        title: '授权成功',
                        icon: 'success',
                        duration: 1000
                      })
                      //再次授权，调用wx.getLocation的API
                      vm.getLocation();
                    } else {
                      wx.showToast({
                        title: '授权失败',
                        icon: 'none',
                        duration: 1000
                      })
                    }
                  }
                })
              }
            }
          })
        } else if (res.authSetting['scope.userLocation'] == undefined) {
          //调用wx.getLocation的API
          vm.getLocation();
        } else {
          //调用wx.getLocation的API
          vm.getLocation();
        }
      }
    })
  },
 
  // 微信获得经纬度
  getLocation: function() {
    let vm = this;
    wx.getLocation({
      type: 'wgs84',
      success: function(res) {
        // console.log(JSON.stringify(res))
        var latitude = res.latitude
        var longitude = res.longitude
        var speed = res.speed
        var accuracy = res.accuracy;
        vm.getLocal(latitude, longitude)
      },
      fail: function(res) {
        console.log('fail' + JSON.stringify(res))
      }
    })
  },
  // 获取当前地理位置
  getLocal: function(latitude, longitude) {
    let vm = this;
    qqmapsdk.reverseGeocoder({
      location: {
        latitude: latitude,
        longitude: longitude
      },
      success: function(res) {
        // console.log(JSON.stringify(res))
        let address = res.result.address
        vm.setData({
          locationAddress: address
        })
      },
      fail: function(res) {
        console.log(res)
      }
    });
  },
  // 获取input缓存
  onnameValue(e) {
    let vm = this
    let value = e.detail.value
    vm.setData({nameValue: value})
    wx.setStorageSync('userText',value)
    // 监听用户输入的信息，有内容输入进去，就会使用wx.getStorageSync('userText',value)设置usertext这个key的值，使用 wx.getStorageSync('userText')可以得到usertext这个key的值
  },
  onIDValue(e) {
    let vm = this
    let value = e.detail.value
    vm.setData({IDValue: value})
    wx.setStorageSync('userText2',value)
  },
  onaddressValue(e) {
    let vm = this
    let value = e.detail.value
    vm.setData({addressValue: value})
    wx.setStorageSync('userText3',value)
  },
  
  // 上传图片
  chooseImg: function (e) {
    var vm = this;
    var imgs = this.data.imgs;
    if (imgs.length >= 9) {
      this.setData({
        lenMore: 1
      });
      setTimeout(function () {
        vm.setData({
          lenMore: 0
        });
      }, 2500);
      return false;
    }
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths;
        var imgs = vm.data.imgs;
        // console.log(tempFilePaths + '----');
        for (var i = 0; i < tempFilePaths.length; i++) {
          if (imgs.length >= 9) {
            vm.setData({
              imgs: imgs
            });
            return false;
          } else {
            imgs.push(tempFilePaths[i]);
          }
        }
        // console.log(imgs);
        vm.setData({
          imgs: imgs,
          hiddenName: !vm.data.hiddenName
        });
      }
    });
  },
  // 删除图片
  deleteImg: function (e) {
    var imgs = this.data.imgs;
    var index = e.currentTarget.dataset.index;
    imgs.splice(index, 1);
    this.setData({
      imgs: imgs,
      hiddenName: !this.data.hiddenName
    });
  },
  // 预览图片
  previewImg: function (e) {
    //获取当前图片的下标
    var index = e.currentTarget.dataset.index;
    //所有图片
    var imgs = this.data.imgs;
    wx.previewImage({
      //当前显示图片
      current: imgs[index],
      //所有图片
      urls: imgs
    })
  },

  // 表单验证
  saveNewAddress: function () {
    let vm = this,
     regionFlag = vm.data.regionFlag,//地址
     addressStatus = vm.data.addressStatus,
     region = vm.data.region
   if (vm.data.nameValue == "" || vm.data.nameValue == 'None') {
     wx.showToast({
       title: '请输入姓名',
       icon: 'fail',
       duration: 2000
     })
     return;
   } else if (vm.data.IDValue.length!=18) {
     wx.showToast({
       title: '请输入身份证号码',
       icon: 'success',
       duration: 2000
     })
     return;
   } else if (vm.data.addressValue == "" || vm.data.addressValue == 'None') {
    wx.showToast({
      title: '请输入居住地址',
      icon: 'success',
      duration: 2000
    })
    return;
   } else if (!vm.data.radioValue1) {
     wx.showToast({
       title: '请输入04题',
       icon: 'success',
       duration: 2000
     })
     return;
   } else if (!vm.data.radioValue2) {
    wx.showToast({
      title: '请输入05题',
      icon: 'success',
      duration: 2000
    })
    return;
   } else if (!vm.data.radioValue3) {
    wx.showToast({
      title: '请输入06题',
      icon: 'success',
      duration: 2000
    })
    return;
   } else if (vm.data.imgs.length == 0) {
    wx.showToast({
      title: '请上传截图',
      icon: 'success',
      duration: 2000
    })
    return;
   } else if (!vm.data.locationAddress) {
    wx.showToast({
      title: '请选择当前位置',
      icon: 'success',
      duration: 2000
    })
    return;
   }
   //把数据给云数据库
   let db = wx.cloud.database({});
   let cont = db.collection('gold');
   cont.add({
     data: {
       name: vm.data.nameValue,
       ID: vm.data.IDValue,
       address: vm.data.addressValue,
       radio1: vm.data.radioValue1,
       radio2: vm.data.radioValue2,
       radio3: vm.data.radioValue3,
       image: vm.data.imgs,
       locationAddress: vm.data.locationAddress
     },
     success: function (res) {
       console.log(res._id)
       wx.showModal({
         title: '成功',
         content: '您已经登记成功',
         showCancel: false
       })
     }
   });
   //把数据给云数据库
 },
})