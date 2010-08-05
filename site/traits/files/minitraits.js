
var Trait=(function(){var SUPPORTS_DEFINEPROP=(function(){try{var test={};Object.defineProperty(test,'x',{get:function(){return 0;}});return test.x===0;}catch(e){return false;}})();function supportsGOPD(){try{if(Object.getOwnPropertyDescriptor){var test={x:0};return!!Object.getOwnPropertyDescriptor(test,'x');}}catch(e){}
return false;};function supportsDP(){try{if(Object.defineProperty){var test={};Object.defineProperty(test,'x',{value:0});return test.x===0;}}catch(e){}
return false;};var call=Function.prototype.call;var bindThis=Function.prototype.bind?function(fun,self){return Function.prototype.bind.call(fun,self);}:function(fun,self){function funcBound(var_args){return fun.apply(self,arguments);}
return funcBound;};var hasOwnProperty=bindThis(call,Object.prototype.hasOwnProperty);var slice=bindThis(call,Array.prototype.slice);var forEach=Array.prototype.forEach?bindThis(call,Array.prototype.forEach):function(arr,fun){for(var i=0,len=arr.length;i<len;i++){fun(arr[i]);}};var freeze=(Object.freeze?function(obj){Object.freeze(obj);return obj;}:function(obj){return obj;});var getPrototypeOf=Object.getPrototypeOf||function(obj){return Object.prototype;};var getOwnPropertyNames=Object.getOwnPropertyNames||function(obj){var props=[];for(var p in obj){if(hasOwnProperty(obj,p)){props.push(p);}}
return props;};var getOwnPropertyDescriptor=supportsGOPD()?Object.getOwnPropertyDescriptor:function(obj,name){return{value:obj[name],enumerable:true,writable:true,configurable:true};};var defineProperty=supportsDP()?Object.defineProperty:function(obj,name,pd){obj[name]=pd.value;};var defineProperties=Object.defineProperties||function(obj,propMap){for(var name in propMap){if(hasOwnProperty(propMap,name)){defineProperty(obj,name,propMap[name]);}}};var Object_create=Object.create||function(proto,propMap){var self;function dummy(){};dummy.prototype=proto||Object.prototype;self=new dummy();if(propMap){defineProperties(self,propMap);}
return self;};var getOwnProperties=Object.getOwnProperties||function(obj){var map={};forEach(getOwnPropertyNames(obj),function(name){map[name]=getOwnPropertyDescriptor(obj,name);});return map;};function makeConflictAccessor(name){var accessor=function(var_args){throw new Error("Conflicting property: "+name);};freeze(accessor.prototype);return freeze(accessor);};function makeRequiredPropDesc(name){return freeze({value:undefined,enumerable:false,required:true});}
function makeConflictingPropDesc(name){var conflict=makeConflictAccessor(name);if(SUPPORTS_DEFINEPROP){return freeze({get:conflict,set:conflict,enumerable:false,conflict:true});}else{return freeze({value:conflict,enumerable:false,conflict:true});}}
function identical(x,y){if(x===y){return x!==0||1/x===1/y;}else{return x!==x&&y!==y;}}
function isSameDesc(desc1,desc2){if(desc1.conflict&&desc2.conflict){return true;}else{return(desc1.get===desc2.get&&desc1.set===desc2.set&&identical(desc1.value,desc2.value)&&desc1.enumerable===desc2.enumerable&&desc1.required===desc2.required&&desc1.conflict===desc2.conflict);}}
function freezeAndBind(meth,self){return freeze(bindThis(meth,self));}
function makeSet(names){var set={};forEach(names,function(name){set[name]=true;});return freeze(set);}
var required=freeze({toString:function(){return'<Trait.required>';}});function trait(obj){var map={};forEach(getOwnPropertyNames(obj),function(name){var pd=getOwnPropertyDescriptor(obj,name);if(pd.value===required){pd=makeRequiredPropDesc(name);}else if(typeof pd.value==='function'){pd.method=true;if('prototype'in pd.value){freeze(pd.value.prototype);}}else{if(pd.get&&pd.get.prototype){freeze(pd.get.prototype);}
if(pd.set&&pd.set.prototype){freeze(pd.set.prototype);}}
map[name]=pd;});return map;}
function compose(var_args){var traits=slice(arguments,0);var newTrait={};forEach(traits,function(trait){forEach(getOwnPropertyNames(trait),function(name){var pd=trait[name];if(hasOwnProperty(newTrait,name)&&!newTrait[name].required){if(pd.required){return;}
if(!isSameDesc(newTrait[name],pd)){newTrait[name]=makeConflictingPropDesc(name);}}else{newTrait[name]=pd;}});});return freeze(newTrait);}
function exclude(names,trait){var exclusions=makeSet(names);var newTrait={};forEach(getOwnPropertyNames(trait),function(name){if(!hasOwnProperty(exclusions,name)||trait[name].required){newTrait[name]=trait[name];}else{newTrait[name]=makeRequiredPropDesc(name);}});return freeze(newTrait);}
function override(var_args){var traits=slice(arguments,0);var newTrait={};forEach(traits,function(trait){forEach(getOwnPropertyNames(trait),function(name){var pd=trait[name];if(!hasOwnProperty(newTrait,name)||newTrait[name].required){newTrait[name]=pd;}});});return freeze(newTrait);}
function rename(map,trait){var renamedTrait={};forEach(getOwnPropertyNames(trait),function(name){if(hasOwnProperty(map,name)&&!trait[name].required){var alias=map[name];if(hasOwnProperty(renamedTrait,alias)&&!renamedTrait[alias].required){renamedTrait[alias]=makeConflictingPropDesc(alias);}else{renamedTrait[alias]=trait[name];}
if(!hasOwnProperty(renamedTrait,name)){renamedTrait[name]=makeRequiredPropDesc(name);}}else{if(hasOwnProperty(renamedTrait,name)){if(!trait[name].required){renamedTrait[name]=makeConflictingPropDesc(name);}}else{renamedTrait[name]=trait[name];}}});return freeze(renamedTrait);}
function resolve(resolutions,trait){var renames={};var exclusions=[];for(var name in resolutions){if(hasOwnProperty(resolutions,name)){if(resolutions[name]){renames[name]=resolutions[name];}else{exclusions.push(name);}}}
return rename(renames,exclude(exclusions,trait));}
function create(proto,trait){var self=Object_create(proto);var properties={};forEach(getOwnPropertyNames(trait),function(name){var pd=trait[name];if(pd.required){if(!(name in proto)){throw new Error('Missing required property: '+name);}}else if(pd.conflict){throw new Error('Remaining conflicting property: '+name);}else if('value'in pd){if(pd.method){properties[name]={value:freezeAndBind(pd.value,self),enumerable:pd.enumerable,configurable:pd.configurable,writable:pd.writable};}else{properties[name]=pd;}}else{properties[name]={get:pd.get?freezeAndBind(pd.get,self):undefined,set:pd.set?freezeAndBind(pd.set,self):undefined,enumerable:pd.enumerable,configurable:pd.configurable,writable:pd.writable};}});defineProperties(self,properties);return freeze(self);}
function object(record,options){return create(Object.prototype,trait(record),options);}
function eqv(trait1,trait2){var names1=getOwnPropertyNames(trait1);var names2=getOwnPropertyNames(trait2);var name;if(names1.length!==names2.length){return false;}
for(var i=0;i<names1.length;i++){name=names1[i];if(!trait2[name]||!isSameDesc(trait1[name],trait2[name])){return false;}}
return true;}
if(!Object.create){Object.create=Object_create;}
if(!Object.getOwnProperties){Object.getOwnProperties=getOwnProperties;}
function Trait(record){return trait(record);}
Trait.required=freeze(required);Trait.compose=freeze(compose);Trait.resolve=freeze(resolve);Trait.override=freeze(override);Trait.create=freeze(create);Trait.eqv=freeze(eqv);Trait.object=freeze(object);return freeze(Trait);})();if(typeof exports!=="undefined"){exports.Trait=Trait;}