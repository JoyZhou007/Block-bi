import {
	Component,
	OnInit,
	Inject, OnDestroy
} from '@angular/core';
import {UserModelService} from '../../shared/services/index.service';
import {Subscription} from "rxjs/Subscription";


@Component({
  selector: 'workflow-user',
  templateUrl: '../template/workflow-user.component.html',
  providers: [UserModelService]
})


export class WorkflowUserComponent implements OnInit, OnDestroy {
  //@ViewChild('inputDate') inputDate : any;
	public subscription: Subscription;
  constructor(
      @Inject('user-data.service') public userDataService : any,
			@Inject('dialog.service') public dialogService : any,
			@Inject('notification.service') public notificationService : any
  ) {

		//接收消息
		this.subscription = this.notificationService.getNotification().subscribe(
			(message:any) => {
				this.dealMessage(message);
			});

    //this.router.navigate(['UserLogin']);
  }

	ngOnInit() {
	}

	dealMessage(message : any) {
	}

	ngOnDestroy(): void {
		this.subscription.unsubscribe();
	}

}
