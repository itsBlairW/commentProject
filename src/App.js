//import { handleClientScriptLoad } from 'next/script'
import './App.scss'
import avatar from './images/bozai.png'
import { useEffect, useRef, useState } from 'react'
import _ from 'lodash'
import classNames from 'classnames'
import {v4 as uuidV4} from 'uuid'
import dayjs from 'dayjs'
import axios from 'axios'

/**
 * 评论列表的渲染和操作
 *
 * 1. 根据状态渲染评论列表
 * 2. 删除评论
 */


// 当前登录用户信息
const user = {
  // 用户id
  uid: '30009257',
  // 用户头像
  avatar,
  // 用户昵称
  uname: 'Blair',
}

/**
 * 导航 Tab 的渲染和操作
 *
 * 1. 渲染导航 Tab 和高亮
 * 2. 评论列表排序
 *  最热 => 喜欢数量降序
 *  最新 => 创建时间降序
 */

// 导航 Tab 数组
const tabs = [
  { type: 'hot', text: 'Hottest' },
  { type: 'time', text: 'Recent' },
]

//封装请求数据的Hook
function useGetList(){
  //获取接口数据渲染
  const [commentList, setCommentList] = useState([])

  useEffect(() => {
    //Request Data
    async function getList() {
      //axios request data
      const res = await axios.get('http://localhost:3004/list')
      setCommentList(res.data)
    }
    getList()
  }, [])

  return{
    commentList,
    setCommentList
  }

}

//封装Item组件
function Item({item, onDel}){
  return(
    <div className="reply-item">
            {/* 头像 */}
            <div className="root-reply-avatar">
              <div className="bili-avatar">
                <img
                  className="bili-avatar-img"
                  alt=""
                  src={item.user.avatar}
                />
              </div>
            </div>

            <div className="content-wrap">
              {/* 用户名 */}
              <div className="user-info">
                <div className="user-name">{item.user.uname}</div>
              </div>
              {/* 评论内容 */}
              <div className="root-reply">
                <span className="reply-content">{item.content}</span>
                <div className="reply-info">
                  {/* 评论时间 */}
                  <span className="reply-time">{item.ctime}</span>
                  {/* 评论数量 */}
                  <span className="reply-time">Like:{item.like}</span>
                  {/*条件：user.id == item.user.id */}
                  {user.uid === item.user.uid &&
                  <span className="delete-btn" onClick={() => onDel(item.rpid)}>
                    Delete
                  </span>}
                </div>
              </div>
            </div>
          </div>
  )
}


const App = () => {
  //渲染评论列表
  //1. 使用useState维护list
  // const [commentList, setCommentList] = useState(_.orderBy(defaultList,'like', 'desc'))

  //调用函数解构复制
  const {commentList, setCommentList} = useGetList()
  
  //删除
  const handleDelete = (id) =>{
    console.log(id)
    //对commentList做过滤处理
    setCommentList(commentList.filter(item => item.rpid !== id))
  }

  //Tab切换功能
  //1. 点击谁就把谁的type记录下来
  //2. 通过记录的type和每一项遍历时的type做匹配，控制激活类名的显示
  const [type, setType] = useState('hot')
  const handleTabChange = (type) =>{
    console.log(type)
    setType(type)
    //基于列表的排序
    if(type === 'hot'){
      //根据点赞数排序
      // lodash
      setCommentList(_.orderBy(commentList, 'like', 'desc'))
    }else{
      //根据创建时间排序
      setCommentList(_.orderBy(commentList, 'ctime', 'desc'))
    }
  }

  //发表评论
  const [content, setContent] = useState('')
  const inputRef = useRef(null)
  const handlePublish = () =>{
    setCommentList([
      ...commentList,
      {
        rpid: uuidV4(),//随机id
        user: {
          uid: '30009257', 
          avatar,
          uname: 'Blair',
        },
        content: content,
        ctime: dayjs(new Date()).format('MM-DD HH:mm'), //格式化 月-日 时：分
        like: 66,
      }
    ])
    //清空输入框内容
    setContent('')
    //重新聚焦 dom(useRef)-focus
    inputRef.current.focus()
  }



  return (
    <div className="app">
      {/* 导航 Tab */}
      <div className="reply-navigation">
        <ul className="nav-bar">
          <li className="nav-title">
            <span className="nav-title-text">Comment</span>
            {/* 评论数量 */}
            <span className="total-reply">{10}</span>
          </li>
          <li className="nav-sort">
            {/* 高亮类名： active */}
            {tabs.map(item => 
              <span key={item.type} 
              onClick={()=>handleTabChange(item.type)} 
              //className={`nav-item ${type === item.type && 'active'}`}>
              className={classNames('nav-item', {active: type === item.type})}>
              {item.text}
              </span> )}
          </li>
        </ul>
      </div>

      <div className="reply-wrap">
        {/* 发表评论 */}
        <div className="box-normal">
          {/* 当前用户头像 */}
          <div className="reply-box-avatar">
            <div className="bili-avatar">
              <img className="bili-avatar-img" src={avatar} alt="用户头像" />
            </div>
          </div>
          <div className="reply-box-wrap">
            {/* 评论框 */}
            <textarea
              className="reply-box-textarea"
              placeholder="Say something friendly~"
              ref={inputRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            {/* 发布按钮 */}
            <div className="reply-box-send">
              <div className="send-text" onClick={handlePublish}>Publish</div>
            </div>
          </div>
        </div>
        {/* 评论列表 */}
        <div className="reply-list">
          {/* 评论项 */}
          {commentList.map(item=> <Item key = {item.id} item={item} onDel ={handleDelete}/>)}
        </div>
      </div>
    </div>
  )
}

export default App