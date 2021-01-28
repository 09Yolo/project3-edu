<template>
	<div>
		<el-upload accept=".jpg,.png"
		           ref="upload"
		           list-type="picture-card"
		           action="/student/avatarupload"
		           name="avatar"
		           :headers="uploadHeaders"
			   :before-upload="beforeAvatarUpload"
			   :on-success="avatarUploadSuccess"
			   :on-remove="avatarRemove">
			<i class="el-icon-plus"></i>
			<p slot="tip" class="tip">只能上传jpg或png文件，且大小不超过2MB</p>
		</el-upload>
		<el-button type="primary" :disabled="upload.model.stu_avatar_new === ''" @click="aaa">确定</el-button>
	</div>
</template>

<script type="text/ecmascript-6">
        export default {
                name: "Attendence",
	        data() {
                  return {
                          uploadHeaders: {"Authorization": sessionStorage.getItem("token")},
	                  upload: {
				isUpload: false,
		                  model: {
				        stu_id: 11,
			                  stu_avatar_old: null,
			                  stu_avatar_new: ""
		                  }
	                  },
                  } ;
	        },
	        methods: {
                        beforeAvatarUpload(file) {
                                const isJPG = file.type === 'image/jpeg';
                                const isPNG = file.type === 'image/png';
                                const isLt2M = file.size / 1024 / 1024 < 2;

                                if ((!isJPG) && (!isPNG)) {
                                        this.$message.error('上传头像图片只能是 JPG 或 PNG 格式!');
                                }
                                if (!isLt2M) {
                                        this.$message.error('上传头像图片大小不能超过 2MB!');
                                }
                                return (isJPG || isPNG) && isLt2M;
                        },
		        avatarUploadSuccess({status, data, message }, file, fileList) {
                                switch(status) {
	                                case 200:
						this.upload.model.stu_avatar_new = data;
						if(fileList.length > 1) fileList.shift();
						break;
	                                case 401:

	                                case 404:
	                                case 199:
	                                case 500:
	                                        this.$message.error(message);
                                }
		        },
		        avatarRemove(file, fileList) {
                                this.upload.model.stu_avatar_new = "";
		        },
		        async aaa() {
                                await this.$http({
	                                method: "post",
	                                url: "/student/avatarupdate",
	                                data: this.upload.model
                                });
                                this.$message.success("头像上传更新成功！");     //提示用户上传成功
			        this.upload.isUpload = false;           //关闭上传头像对话框
			        this.$refs.upload.clearFiles();               //重置上传控件，为下一次做准备

		        },
	        },
        };
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
	p.tip
		color: red
</style>