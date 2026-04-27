export default function HelpPage() {
  return (
    <div className="p-4 space-y-6 max-w-2xl">
      <h2 className="text-lg font-semibold">使用帮助</h2>

      <section className="space-y-2">
        <h3 className="font-medium">Prompt 编写技巧</h3>
        <ul className="text-sm text-[var(--text-secondary)] space-y-1.5 list-disc list-inside">
          <li>尽量描述具体：主体、场景、风格、光线、颜色等</li>
          <li>支持中英文，英文通常效果更好</li>
          <li>可以指定艺术风格：水彩、油画、像素画、3D 渲染等</li>
          <li>避免在 Prompt 中写图片比例，用比例选择器设置</li>
          <li>示例：<span className="text-[var(--text)] bg-[var(--hover)] px-1.5 py-0.5 rounded">A corgi astronaut on the moon, cinematic lighting, 8k</span></li>
        </ul>
      </section>

      <section className="space-y-2">
        <h3 className="font-medium">图片比例说明</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="p-2 bg-[var(--hover)] rounded-lg">
            <span className="font-medium">1:1</span> — 正方形，社交头像
          </div>
          <div className="p-2 bg-[var(--hover)] rounded-lg">
            <span className="font-medium">16:9</span> — 宽屏横版，壁纸/封面
          </div>
          <div className="p-2 bg-[var(--hover)] rounded-lg">
            <span className="font-medium">9:16</span> — 竖版，手机壁纸/短视频
          </div>
          <div className="p-2 bg-[var(--hover)] rounded-lg">
            <span className="font-medium">4:3</span> — 标屏横版，PPT/文档
          </div>
          <div className="p-2 bg-[var(--hover)] rounded-lg">
            <span className="font-medium">3:2</span> — 经典照片比例
          </div>
          <div className="p-2 bg-[var(--hover)] rounded-lg">
            <span className="font-medium">21:9</span> — 超宽横版，Banner
          </div>
        </div>
      </section>

      <section className="space-y-2">
        <h3 className="font-medium">图生图</h3>
        <ul className="text-sm text-[var(--text-secondary)] space-y-1.5 list-disc list-inside">
          <li>点击「添加参考图」上传 1~16 张图片</li>
          <li>支持拖拽上传，支持 JPG/PNG/WebP 格式</li>
          <li>参考图会影响生成结果的构图和风格</li>
          <li>Prompt 中描述你希望如何变化，如「变成水彩画风格」</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h3 className="font-medium">其他功能</h3>
        <ul className="text-sm text-[var(--text-secondary)] space-y-1.5 list-disc list-inside">
          <li><strong>收藏</strong>：在卡片右上角点击星号标记喜欢的图片</li>
          <li><strong>标签</strong>：在详情页给图片添加标签，方便分类</li>
          <li><strong>搜索</strong>：在历史页搜索 Prompt 关键词</li>
          <li><strong>筛选</strong>：按状态或收藏筛选历史记录</li>
          <li><strong>批量操作</strong>：点击「选择」进入多选模式</li>
          <li><strong>分享</strong>：生成完成后可以分享链接给他人</li>
          <li><strong>暗黑模式</strong>：侧边栏底部切换主题</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h3 className="font-medium">注意事项</h3>
        <ul className="text-sm text-[var(--text-secondary)] space-y-1.5 list-disc list-inside">
          <li>生成通常需要 30~60 秒，请耐心等待</li>
          <li>图片链接有效期约 24 小时，请及时下载</li>
          <li>内容会经过安全审核，违规内容将被拒绝</li>
          <li>请求过于频繁会被限流，稍后重试即可</li>
        </ul>
      </section>
    </div>
  );
}
