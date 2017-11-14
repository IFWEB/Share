### =====简单的数值、布尔、字符串类型的值的传递
如果参数是上面这种简单的类型，必须要使用相应的Java方法转换。如果是对象中包含的某个属性是上面的简单类型则可以不必转换。
如服务Dubbo.IRechargeService.getRechargeInfo(String serialNum);传递的参数必须如下转换
```
Java.String(param.serialNum)
```
如服务接口Dubbo.IRechargeService.getRechargeInfoList(CRechargeQueryDto cRechargeQueryDto,Pagination page)，其中CRechargeQueryDto结构为
```
public class CRechargeQueryDto extends RechargeBaseDto{
	...

	/**
	 * 流水号
	 */
	private String serialNum;
	/**
	 * 	用户名
	 */
	private String userName;

	...
}
```
传递cRechargeQueryDto的时候有两种传递方式
```
//第一种，每一个数据类型都转换
Java('com.njq.nongfadai.dto.funds.CRechargeQueryDto', {
	serialNum: Java.String(param.serialNum),
	userName: Java.String(param.userName)
})

//第二种，内部的简单类型不用转换
Java('com.njq.nongfadai.dto.funds.CRechargeQueryDto', {
	serialNum: param.serialNum,
	userName: param.userName
})
```
### =====枚举类型传值
如果遇到java定义的枚举类型，形如
```
public enum CardType {
	
    NO10(10,"借记卡"),
    NO20(20,"贷记卡");  
    ...
}
```
那么，我们传递CardType类型的值必须使用js-to-java提供的枚举类型，比如传递给后台‘NO10’枚举值
```
Java.enum(`com.njq.lcfarm.dto.frontend.component.enums.CardType`, 'NO10'),
```