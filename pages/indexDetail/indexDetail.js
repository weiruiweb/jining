import {Api} from '../../utils/api.js';
var api = new Api();
const app = getApp()

Page({
  data: {
   
    region: ['陕西省', '西安市', '雁塔区'],
    id:'',

    mainImg:[],
    submitData:{
      content:'',
      passage1:'',
      mainImg:[],
      title:'',
      keywords:'',
      phone:'',
      passage_array:'',
      product_no:'',
      passage2:''
    },
 
    
  },
  //事件处理函数
 
  onLoad(options){
    const self = this;
    self.data.id = options.id;
    self.data.submitData.product_no = options.id;
    console.log(self.data.product_no)
    self.setData({
      web_imgData:self.data.submitData.mainImg
    });
    self.getMainData()
  },


  bindRegionChange: function (e) {
    const self = this;
    console.log('picker发送选择改变，携带值为', e.detail.value)
    self.data.submitData.passage1 = e.detail.value[0]+e.detail.value[1]+e.detail.value[2];
    self.setData({
      web_region: e.detail.value
    })
    console.log(self.data.submitData)
  },

  messageAdd(){
    const self = this;
    const postData = {};
    postData.token = wx.getStorageSync('token');
    postData.data = {};
    postData.data = api.cloneForm(self.data.submitData);
    const callback = (data)=>{
      if(data.solely_code == 100000){
        api.showToast('留言成功','fail');
      }else{
        api.showToast('网络故障','fail');
      };
      wx.hideLoading(); 
    };
    api.messageAdd(postData,callback);
      
  },

  changeBind(e){
    const self = this;
    api.fillChange(e,self,'submitData');
    self.setData({
      web_submitData:self.data.submitData,
    });  
    console.log(self.data.submitData)
  },

  reSetInfomation(){
    const self = this;
    self.data.submitData = {
      content:'',
      passage1:'',
      mainImg:[],
      title:'',
      keywords:'',
      phone:'',
      passage_array:'',
      product_no:'',
      passage2:'',
    };
    self.setData({
      web_submitData:self.data.submitData,
    }); 
  },

submit(){
    const self = this;
    var phone = self.data.submitData.phone;
    var id_num = self.data.submitData.keywords;
    const pass = api.checkComplete(self.data.submitData);
    if(pass){
      if(!id_num || !/^\d{6}(18|19|20)?\d{2}(0[1-9]|1[012])(0[1-9]|[12]\d|3[01])\d{3}(\d|[xX])$/.test(id_num)){
        api.showToast('身份证格式错误','fail')
      }else{
        if(phone.trim().length != 11 || !/^1[3|4|5|6|7|8|9]\d{9}$/.test(phone)){
          api.showToast('手机格式错误','fail')
        }else{
          self.messageAdd();
        }
      }
    }else{
      api.showToast('请补全信息','fail');
    };
  },


  getMainData(){
    const self = this;
    const postData = {};
    postData.searchItem = {
      thirdapp_id:getApp().globalData.thirdapp_id,
      id:self.data.id
    };
    const callback = (res)=>{
      self.data.mainData = {};
      if(res.info.data.length>0){
        self.data.mainData = res.info.data[0];
        self.data.mainData.content = api.wxParseReturn(res.info.data[0].content).nodes;
      };

      self.setData({
        web_mainData:self.data.mainData,
      });  
    };
    api.articleGet(postData,callback);
  },



  intoPath(e){
    const self = this;
    api.pathTo(api.getDataSet(e,'path'),'nav');
  },


  upLoadImg: function (){
    var self = this;
    if(self.data.submitData.mainImg.length>2){
      api.showToast('仅限3张','fail');
      return;
    };
    wx.showLoading({
      mask: true,
      title: '图片上传中',
    });
    var mainImg = self.data.mainImg
    wx.chooseImage({
      count:1,
      success: function(res) {
        console.log(res);
        var tempFilePaths = res.tempFilePaths
        
        wx.uploadFile({
          url: 'https://liubin.yisuiyanghuoguo.com/liubin/public/index.php/api/v1/Base/FtpImage/upload ',
          filePath:tempFilePaths[0],
          name: 'file',
          formData: {
            token:wx.getStorageSync('token')
          },
          success: function(res){
            res = JSON.parse(res.data);
            self.data.submitData.mainImg.push({url:res.info.url})
            self.setData({
              web_imgData:self.data.submitData.mainImg
            });
            wx.hideLoading()

          },
          fail: function(err){
            wx.hideLoading();
            api.showToast('上传失败','fail')
          }
        })
      },
      fail: function(err){
        wx.hideLoading();
      }
    })
  },



  


 
})

  