export function recommendationPeriod(item:{period:string|null;opens:string|null;closes:string|null}):string {
 const format=(date:string)=>new Intl.DateTimeFormat("id-ID",{day:"numeric",month:"short",year:"numeric",timeZone:"UTC"}).format(new Date(date+"T00:00:00Z"));
 if(item.opens&&item.closes)return format(item.opens)+" – "+format(item.closes);
 if(item.opens)return "Mulai "+format(item.opens);
 if(item.closes)return "Sampai "+format(item.closes);
 const period=item.period?.trim();
 if(!period||/pengumuman resmi|tanggal belum|jadwal belum|jadwal mengikuti|belum ditetapkan/i.test(period))return "Menunggu jadwal resmi";
 return period.length>65?"Lihat jadwal di detail":period;
}
