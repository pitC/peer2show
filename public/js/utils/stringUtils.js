define([],function () {
	
	var stringUtils =  {
		
		
		
		replace : function(str,replacements){
			console.log("String replace");
			console.log(str);
			console.log(replacements);
			str = str.replace(/%\w+%/g, function(all) {
				   return replacements[all] || all;
			});
			
			return str;
		}
		
	};
	
	return stringUtils;
});