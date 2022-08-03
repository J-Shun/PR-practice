const check = document.querySelector('button')
// const apiDomain = './frontend_data.json'
const apiDomain = 'https://raw.githubusercontent.com/hexschool/2021-ui-frontend-job/master/frontend_data.json'


init()

async function init(){
    const res = await axios.get(apiDomain)
    const datas = res.data
    console.log(datas)
    
    // 男女比
    const getSexTotal = () => {
        let obj = datas.reduce((total, currentObj) => {
            if(currentObj.gender == '男性'){
                total.male ++
            }
            if(currentObj.gender == '女性'){
                total.female ++
            }
            return total
        },{male: 0, female: 0, sexRatio:0})
        obj.sexRatio = Math.round((obj.male/obj.female)*100)
        return obj
    }
    
    // 31-35歲共幾個男生女生
    const get31And35 = () => {
        let obj = datas.reduce((total, item) => {
            if(item.age == '31~35 歲'){
                if(item.gender == '男性'){
                    total.male ++
                }
                if(item.gender == '女性'){
                    total.female ++
                }
            }
            return total
        },{title: '31-35歲的男女生', male:0, female:0})
        return obj
    }
    
    // 26-30 ＆＆ 大專院校畢業幾個人
    const get26And30University = () => {
        let obj = datas.reduce((total, item) => {
            if(item.age == '26~30 歲' && item.education == '大專院校畢業'){
                total.total++
                if(item.gender == '男性')total.male++
                if(item.gender == '女性')total.female++    
            }
            return total
        },{title: '26-30歲同時大專院校畢業', male:0, female:0,  total:0})
        return obj
    }
    
    //全部人加起來平均年薪多少
    const annualOfAverage = () => {
        const annualInfo = () => {
            let infoArr = datas.map(item => item.company.salary)
            let infObj = infoArr.reduce((total, item) => {
                if(item in total){
                    total[item]++
                }else{
                    /*不存的東西不會被列進去，所以根本不會被計算到，
                    因此可以放心賦予數值1，因為有找到的東西才會被賦予數值1
                    */
                    total[item] = 1
                }
                return total
            }, {})
            return infObj
        }
        // console.log(annualInfo())
        const annualInfoToNumber = (obj) => {
            let annualPeople = Object.entries(obj).map(item => 
                [item[0].replace(' 萬', '').replace('以下', '').replace('以上', ''), item[1]]
            )
            let annual = annualPeople.map(item => item[0].split('~'))
            let annualValue = annual.map(item => {
                if(item[1]){
                    return [parseInt(item[0]), parseInt(item[1])]
                }else{
                    return [parseInt(item[0])]
                }
            })
            // console.log(annualValue)
            return annualValue
        }
        const annualTimesMedian = () => {
            let numberArrs = annualInfoToNumber(annualInfo())
            // console.log(numberArrs)
            let totalArr = []
            numberArrs.reduce((total, numberArr) => {
                for(const key in total){
                    if(numberArr[1] === undefined){
                        if(key.includes(`36 萬以下`) && numberArr[0] === 36){
                            let firstMedian = (numberArr[0]*10000 + 312000)/2
                            // console.log(firstMedian)
                            // console.log(firstMedian*total[key])
                            totalArr.push(firstMedian*total[key])
                        }
                        if(key.includes(`400 萬以上`) && numberArr[0] === 400){
                            // console.log(numberArr[0])
                            //latestMedian不是中位數，因為400萬以上不用算中位數
                            let latestMedian = numberArr[0]*10000
                            totalArr.push(latestMedian*total[key])
                        }
                    }else {
                        if(key.includes(`${numberArr[0]}~${numberArr[1]} 萬`)){
                            let median = (numberArr[0]*10000 + numberArr[1]*10000)/2
                            totalArr.push(median*total[key])
                        }
                    }
                }
                return total
            }, annualInfo())
            let result = Math.round(totalArr.reduce((a, b) => a + b)/datas.length)
            let obj = {
                總人數: datas.length,
                年薪平均值: result
            }
            return obj
        }
        return annualTimesMedian()
    }

    // ＣＳＲ ＳＳＲ比重
    const checkCSRandSSR = () => {
        let infoCSRandSSR = datas.reduce((total, data) => {
            if(data.first_job.render.includes('CSR')){
                total['CSR']++
            }else if(data.first_job.render.includes('SSR')){
                total['SSR']++
            }else {
                total['others']++
            }
            return total
        },{CSR: 0, SSR:0, others: 0})
        let ration = infoCSRandSSR.CSR/(infoCSRandSSR.CSR + infoCSRandSSR.SSR)
        let roundOfration = Math.round((ration + Number.EPSILON) * 100) / 100
        infoCSRandSSR['CSR比SSR'] = `${roundOfration * 10}:${(1-roundOfration).toFixed(1) * 10}`
        return infoCSRandSSR
    }


    //篩選產業滿意度在七分以上
    const checkSatisfaction = () => {
        //先整理一個產業對應數量
        const checkSingleSatisfaction = () => {
            let satisfaction = datas.reduce((total, data) => {
                if(data.company.score >= 7){
                    let obj = {
                        industry: data.company.industry,
                        score: data.company.score
                    }
                    total.push(obj)
                }
                return total
            }, [])
            let calcArr = satisfaction.map(item => [item.industry, item.score])
            // console.log(calcArr)

            let calcObj = calcArr.reduce((total, item) => {
                if(item[0] in total){
                    total[item[0]]++
                }else{
                    total[item[0]] = 1
                }
                return total
            }, {})
            return [calcArr, calcObj]
        }

        const [calcArr, calcObj] = checkSingleSatisfaction()
        

        const checkAverageSatisfaction = () => {
            console.log(calcArr)
            console.log(calcObj)
            

            let resultCalc = calcArr.reduce((total, item, index, arr) => {
                for(key in calcObj){
                    if(item[0] == key){
                        total.test++
                    }

                    return total
                }
            }, {})
            // console.log(arrCalc)

        }

        checkAverageSatisfaction()
        // return checkSingleSatisfaction()
    }
    

    
    //公司人數規模整理 500人以上30間，字串格式
    const checkCompanyScale = () => {
        const scales = datas.map(data => data.company.scale)
        const scales_clac = scales.reduce((total, scale) => {
            if(scale in total){
                total[scale]++
            }else{
                total[scale] = 1
            }
            return total
        }, {})
        let obj = {}
        for(key in scales_clac){
            obj[key] = `${scales_clac[key]}間`
        }
        return obj
    }

    //有導入特定技術的公司（本題目尚未有明確指標）

    //各產業的平均年薪
    const checkIndustryAnnual = () => {
        /*計算 － 各產業人數、各產業平均年薪*/
        const annualInfo = (arrays) => {
            // console.log(arrays)
            const toNumber = arrays.map(arr => 
                [arr[0], arr[1].map(item => item.replace(/\s|萬|以下|以上/g,'').split('~'))]
            )
            // console.log(toNumber)
            
            let median = toNumber.map(item => [
                item[0],
                item[1].map(annual => {
                    if(annual[1] === undefined){
                        if(annual[0] === '36'){
                            return (parseInt(annual[0])*10000 + 312000)/2
                        }
                        if(annual[0] === '400'){
                            return parseInt(annual[0])*10000
                        }
                    }else{
                        return (parseInt(annual[0])*10000+parseInt(annual[1])*10000)/2
                    }
                })
            ])
            let medianAverage = median.reduce((total, arr) => {
                let annualTotal = arr[1].reduce((a, b, index, array) => (a + b))
                let annualNum = arr[1].length
                let annualAverage = Math.round(annualTotal/annualNum)
                let obj = {
                    產業: arr[0],
                    產業人數: annualNum,
                    平均年薪: `${annualAverage}元`
                }
                total.push(obj)
                return total
            },[])
            // console.log(medianAverage)
            return medianAverage
        }
        


        //各產業別的人數
        const checkIndustries_Nums = () => {
            const industriesDatas = datas.map(data => data.company.industry)
            // console.log(industriesDatas)
            
            const industriesNums = industriesDatas.reduce((total, item) => {
                if(item in total){
                    total[item]++
                }else{
                    total[item] = 1
                }
                return total
            }, {})
            // console.log(industriesNums)
            return industriesNums
        }

        //各產業別的年薪級距分布
        const checkIndustriess_Annuals = () => {
      
            const industriesAnnuals = {}
            for(const key in checkIndustries_Nums()){
                industriesAnnuals[key] = []
            }
            // console.log(industriesAnnuals)

            datas.reduce((total, data) => {
                for(key in total){
                    if(data.company.industry == key){
                        total[key].push(data.company.salary)
                    }
                }
                return total
            }, industriesAnnuals)
            // console.log(industriesAnnuals)

            return industriesAnnuals
        }

        // console.log(checkIndustries_Nums())
        // console.log(checkIndustriess_Annuals())

        return annualInfo(Object.entries(checkIndustriess_Annuals()))
    }

    check.addEventListener('click', () => {
        console.log('題目一：男女性比例')
        console.log(getSexTotal())

        console.log('題目二：31~35 歲共幾個男生幾個女生')
        console.log(get31And35())

        console.log('題目三：26~30歲大專院校畢業有幾人')
        console.log(get26And30University())

        console.log('題目四：全部人加起來的年薪平均值')
        console.log(annualOfAverage())

        console.log('題目五：CSR、SSR 佔比')
        console.log(checkCSRandSSR())

        // 題目六：篩選產業平均滿意度在 7 分以上（待修改）
        console.log('題目六：篩選產業平均滿意度在 7 分以上（待修改）')
        checkSatisfaction()

        console.log('題目七：公司人數規模整理')
        console.log(checkCompanyScale())

        // 題目八：有導入技術的公司
        console.log('題目八：有導入技術的公司（待補）')

        console.log('題目九：各產業的平均年薪')
        console.log(checkIndustryAnnual())

        // 題目十：各產業的各年資的平均薪水滿意度
        console.log('題目十：各產業的各年資的平均薪水滿意度（待補）')
    })
}
